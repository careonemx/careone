package com.careone.api.core.inicio;

import com.careone.api.core.cita.Cita;
import com.careone.api.core.cita.CitaRecord;
import com.careone.api.core.cita.CitaRepository;
import com.careone.api.core.clinica.Clinica;
import com.careone.api.core.clinica.ClinicaRepository;
import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.doctor.DoctorRepository;
import com.careone.api.core.pago.PagoRepository;
import com.careone.api.security.SecurityUtil;
import com.careone.api.util.enums.EstadoCita;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InicioService {

    private final CitaRepository citaRepository;
    private final PagoRepository pagoRepository;
    private final ClinicaRepository clinicaRepository;
    private final DoctorRepository doctorRepository;

    public InicioService(CitaRepository citaRepository, PagoRepository pagoRepository,
                         ClinicaRepository clinicaRepository, DoctorRepository doctorRepository) {
        this.citaRepository = citaRepository;
        this.pagoRepository = pagoRepository;
        this.clinicaRepository = clinicaRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public InicioRecord resumen(LocalDate fecha) {
        // Filtro por rol: si el usuario es DOCTOR/AYUDANTE, solo ve lo suyo.
        Long doctorId = doctorIdDelUsuarioSiAplica();

        // ---- Agenda del dia (filtrada por doctor si aplica) ----
        List<Cita> citasHoy = (doctorId != null)
                ? citaRepository.findDelDiaPorDoctor(fecha, doctorId)
                : citaRepository.findDelDia(fecha);
        List<CitaRecord> agenda = citasHoy.stream().map(CitaRecord::from).toList();

        // ---- KPIs ----
        int total = citasHoy.size();
        int confirmadas = (int) citasHoy.stream().filter(c -> c.getEstado() == EstadoCita.CONFIRMADA
                || c.getEstado() == EstadoCita.COMPLETADA).count();
        BigDecimal ingresoEsperado = citasHoy.stream()
                .map(Cita::getMonto).filter(m -> m != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal cobradoHoy = citasHoy.stream()
                .filter(c -> c.getEstado() == EstadoCita.COMPLETADA)
                .map(c -> pagoRepository.totalPagadoCita(c.getId()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        var kpis = new InicioRecord.Kpis(total, confirmadas, ingresoEsperado, cobradoHoy);

        // ---- Tarjetas inteligentes ----
        List<InicioRecord.TarjetaInteligente> tarjetas = new ArrayList<>();
        boolean esManana = LocalTime.now().isBefore(LocalTime.NOON);

        // Confirmaciones (citas de hoy AGENDADA). Critica por la manana.
        var confItems = citasHoy.stream()
                .filter(c -> c.getEstado() == EstadoCita.AGENDADA)
                .map(c -> item(c, c.getHoraInicio() + " · " + tipoOMotivo(c)))
                .toList();
        if (!confItems.isEmpty()) {
            tarjetas.add(new InicioRecord.TarjetaInteligente("CONFIRMACIONES",
                    "Confirmaciones pendientes",
                    "Pacientes con cita hoy sin confirmar.", confItems.size(),
                    esManana ? 1 : 3, confItems));
        }

        // Cobranza vencida (completadas con saldo, fecha < hoy). Alta; sube en la tarde.
        var cobItems = new ArrayList<InicioRecord.TarjetaInteligente.Item>();
        for (Cita c : citaRepository.findCobranzaVencida(fecha, doctorId)) {
            BigDecimal pagado = pagoRepository.totalPagadoCita(c.getId());
            BigDecimal saldo = c.getMonto().subtract(pagado);
            if (saldo.compareTo(BigDecimal.ZERO) > 0) {
                cobItems.add(item(c, "$" + saldo.stripTrailingZeros().toPlainString()
                        + " · " + tipoOMotivo(c)));
            }
        }
        if (!cobItems.isEmpty()) {
            tarjetas.add(new InicioRecord.TarjetaInteligente("COBRANZA",
                    "Cobranza vencida",
                    "Citas completadas con saldo pendiente.", cobItems.size(),
                    esManana ? 2 : 1, cobItems));
        }

        // Inasistencias sin reagendar.
        var inaItems = new ArrayList<InicioRecord.TarjetaInteligente.Item>();
        for (Cita c : citaRepository.findInasistencias(doctorId)) {
            if (citaRepository.countCitasFuturas(c.getPaciente().getId(), fecha) == 0) {
                inaItems.add(item(c, "No asistio · " + c.getFecha()));
            }
        }
        if (!inaItems.isEmpty()) {
            tarjetas.add(new InicioRecord.TarjetaInteligente("INASISTENCIAS",
                    "Inasistencias sin reagendar",
                    "Pacientes que faltaron y no tienen nueva cita.", inaItems.size(),
                    2, inaItems));
        }

        // Revisiones proximas (proximos 7 dias).
        var revItems = citaRepository.findRevisionesProximas(fecha, fecha.plusDays(7), doctorId).stream()
                .map(c -> item(c, c.getFecha() + " · " + c.getHoraInicio()))
                .toList();
        if (!revItems.isEmpty()) {
            tarjetas.add(new InicioRecord.TarjetaInteligente("REVISIONES",
                    "Revisiones proximas",
                    "Revisiones programadas en los proximos 7 dias.", revItems.size(),
                    4, revItems));
        }

        // Ordenar por prioridad (menor = mas urgente) y limitar a 5.
        tarjetas.sort(Comparator.comparingInt(InicioRecord.TarjetaInteligente::prioridad));
        if (tarjetas.size() > 5) tarjetas = new ArrayList<>(tarjetas.subList(0, 5));

        return new InicioRecord(saludo(fecha), kpis, tarjetas, agenda);
    }

    // ---- helpers ----

    private Long doctorIdDelUsuarioSiAplica() {
        Long usuarioId = SecurityUtil.currentUsuarioId();
        if (usuarioId == null) return null;
        // Solo filtramos si el usuario tiene perfil de doctor (DOCTOR/AYUDANTE ligado a doctor
        // se cubre en una iteracion futura; por ahora filtra si ES doctor).
        return doctorRepository.findByUsuarioId(usuarioId).map(Doctor::getId).orElse(null);
    }

    private InicioRecord.TarjetaInteligente.Item item(Cita c, String detalle) {
        var p = c.getPaciente();
        String nombre = (p.getNombre() + " " + (p.getApellidos() != null ? p.getApellidos() : "")).trim();
        return new InicioRecord.TarjetaInteligente.Item(c.getId(), p.getId(), nombre, detalle);
    }

    private String tipoOMotivo(Cita c) {
        if (c.getTipoCita() != null) return c.getTipoCita().getNombre();
        if (c.getMotivo() != null && !c.getMotivo().isBlank()) return c.getMotivo();
        return c.getTratamiento();
    }

    private String saludo(LocalDate fecha) {
        Long tenantId = SecurityUtil.currentTenantId();
        String clinica = tenantId != null
                ? clinicaRepository.findById(tenantId).map(Clinica::getNombre).orElse("")
                : "";
        int hora = LocalTime.now().getHour();
        String franja = hora < 12 ? "Buenos dias" : hora < 19 ? "Buenas tardes" : "Buenas noches";
        return clinica.isBlank() ? franja : franja + " · " + clinica;
    }
}

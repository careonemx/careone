package com.careone.api.core.cita;

import com.careone.api.core.clinica.Clinica;
import com.careone.api.core.clinica.ClinicaRepository;
import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.doctor.DoctorRepository;
import com.careone.api.core.paciente.Paciente;
import com.careone.api.core.paciente.PacienteRepository;
import com.careone.api.exception.ConflictException;
import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
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
public class CitaService {

    private static final int SLOT_MINIMO_MIN = 30;

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final DoctorRepository doctorRepository;
    private final ClinicaRepository clinicaRepository;
    private final com.careone.api.core.tipocita.TipoCitaRepository tipoCitaRepository;
    private final com.careone.api.core.bloqueo.BloqueoHorarioRepository bloqueoRepository;
    private final com.careone.api.core.historia.HistoriaClinicaRepository historiaRepository;

    public CitaService(CitaRepository citaRepository, PacienteRepository pacienteRepository,
                       DoctorRepository doctorRepository, ClinicaRepository clinicaRepository,
                       com.careone.api.core.tipocita.TipoCitaRepository tipoCitaRepository,
                       com.careone.api.core.bloqueo.BloqueoHorarioRepository bloqueoRepository,
                       com.careone.api.core.historia.HistoriaClinicaRepository historiaRepository) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.doctorRepository = doctorRepository;
        this.clinicaRepository = clinicaRepository;
        this.tipoCitaRepository = tipoCitaRepository;
        this.bloqueoRepository = bloqueoRepository;
        this.historiaRepository = historiaRepository;
    }

    /** Mapa pacienteId → historia, para derivar alertas sin N+1. */
    private java.util.Map<Long, com.careone.api.core.historia.HistoriaClinica> historiasDe(List<Cita> citas) {
        java.util.Set<Long> ids = citas.stream().map(c -> c.getPaciente().getId()).collect(java.util.stream.Collectors.toSet());
        if (ids.isEmpty()) return java.util.Map.of();
        return historiaRepository.findByPacienteIdIn(ids).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.careone.api.core.historia.HistoriaClinica::getPacienteId, h -> h));
    }

    @Transactional(readOnly = true)
    public AgendaDiaRecord agendaDelDia(LocalDate fecha) {
        List<Cita> citas = citaRepository.findDelDia(fecha);
        var historias = historiasDe(citas);
        List<CitaRecord> citaRecords = citas.stream()
                .map(c -> CitaRecord.from(c, historias.get(c.getPaciente().getId()))).toList();

        // Pendientes
        List<AgendaDiaRecord.PendienteRecord> cobros = new ArrayList<>();
        List<AgendaDiaRecord.PendienteRecord> confirmaciones = new ArrayList<>();
        List<AgendaDiaRecord.PendienteRecord> reagendaciones = new ArrayList<>();
        BigDecimal programado = BigDecimal.ZERO;
        BigDecimal cobrado = BigDecimal.ZERO;

        for (Cita c : citas) {
            String nombre = nombrePaciente(c.getPaciente());
            if (c.getMonto() != null) {
                programado = programado.add(c.getMonto());
                if (c.getEstado() == EstadoCita.COMPLETADA) {
                    cobrado = cobrado.add(c.getMonto());
                }
            }
            if (c.getEstado() == EstadoCita.AGENDADA) {
                confirmaciones.add(new AgendaDiaRecord.PendienteRecord(c.getId(), nombre,
                        c.getTratamiento() + " · " + c.getHoraInicio()));
            } else if (c.getEstado() == EstadoCita.NO_ASISTIO) {
                reagendaciones.add(new AgendaDiaRecord.PendienteRecord(c.getId(), nombre,
                        "No asistio · " + c.getHoraInicio()));
            } else if (c.getEstado() == EstadoCita.COMPLETADA && c.getMonto() != null) {
                cobros.add(new AgendaDiaRecord.PendienteRecord(c.getId(), nombre,
                        c.getMonto() + " · " + c.getTratamiento()));
            }
        }

        List<SlotLibreRecord> slots = calcularSlots(citas);
        var resumen = new AgendaDiaRecord.ResumenDia(citaRecords.size(), programado, cobrado);
        return new AgendaDiaRecord(citaRecords, slots, cobros, confirmaciones, reagendaciones, resumen);
    }

    @Transactional(readOnly = true)
    public List<CitaRecord> historialPaciente(Long pacienteId) {
        var pac = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        if (!SecurityUtil.perteneceAlTenant(pac)) throw new NotFoundException("El paciente no existe.");
        return citaRepository
                .findByPacienteIdAndEstadoNotOrderByFechaDescHoraInicioDesc(pacienteId, EstadoCita.CANCELADA)
                .stream().map(CitaRecord::from).toList();
    }

    /** Citas en un rango (vistas semanal/mensual). Filtra por doctor si el usuario es doctor. */
    @Transactional(readOnly = true)
    public List<CitaRecord> enRango(LocalDate desde, LocalDate hasta) {
        Long usuarioId = SecurityUtil.currentUsuarioId();
        Long doctorId = usuarioId == null ? null
                : doctorRepository.findByUsuarioId(usuarioId).map(Doctor::getId).orElse(null);
        List<Cita> citas = citaRepository.findEnRango(desde, hasta, doctorId);
        var historias = historiasDe(citas);
        return citas.stream()
                .map(c -> CitaRecord.from(c, historias.get(c.getPaciente().getId()))).toList();
    }

    @Transactional
    public CitaRecord crear(CrearCitaRequest req) {
        Paciente paciente = pacienteRepository.findById(req.pacienteId())
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        if (!SecurityUtil.perteneceAlTenant(paciente)) throw new NotFoundException("El paciente no existe.");

        Doctor doctor = resolverDoctor(req.doctorId());

        // Duracion: la enviada o, si no viene, la predeterminada de la clinica.
        int duracion = req.duracionMin() != null ? req.duracionMin() : duracionPorDefecto();

        LocalTime inicio = req.horaInicio();
        LocalTime fin = inicio.plusMinutes(duracion);
        validarSolape(doctor.getId(), req.fecha(), inicio, fin, null);
        // No se puede agendar sobre un horario bloqueado.
        if (!bloqueoRepository.findSolapados(req.fecha(), inicio, fin, doctor.getId()).isEmpty()) {
            throw new ConflictException("Ese horario está bloqueado y no se puede agendar.");
        }

        Cita cita = new Cita();
        cita.setPaciente(paciente);
        cita.setDoctor(doctor);
        if (req.tipoCitaId() != null) {
            cita.setTipoCita(tipoCitaRepository.findById(req.tipoCitaId())
                    .orElseThrow(() -> new NotFoundException("El tipo de cita no existe.")));
        }
        cita.setTratamiento(req.tratamiento() != null ? req.tratamiento() : "Consulta");
        cita.setMotivo(req.motivo());
        cita.setCanalConfirmacion(req.canalConfirmacion());
        cita.setFecha(req.fecha());
        cita.setHoraInicio(inicio);
        cita.setHoraFin(fin);
        cita.setDuracionMin(duracion);
        cita.setMonto(req.monto());
        cita.setRecordatorioWhatsapp(req.recordatorioWhatsapp() == null || req.recordatorioWhatsapp());
        cita.setNotas(req.notas());
        cita.setEstado(EstadoCita.AGENDADA);
        // Primera vez = el paciente no tiene otras citas
        cita.setPrimeraVez(citaRepository.findByPacienteIdAndEstadoNotOrderByFechaDescHoraInicioDesc(
                paciente.getId(), EstadoCita.CANCELADA).isEmpty());
        return CitaRecord.from(citaRepository.save(cita));
    }

    /**
     * Resuelve el doctor de la cita. Si viene id, lo valida en el tenant.
     * Si NO viene (clinica de un solo doctor), lo asigna automaticamente; si hay
     * varios y no se especifico, es un error (el frontend debe mostrar el selector).
     */
    private Doctor resolverDoctor(Long doctorId) {
        if (doctorId != null) {
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new NotFoundException("El doctor no existe."));
            if (!SecurityUtil.perteneceAlTenant(doctor)) throw new NotFoundException("El doctor no existe.");
            return doctor;
        }
        List<Doctor> doctores = doctorRepository.findAllByOrderByIdAsc();
        if (doctores.isEmpty()) {
            throw new ConflictException("La clinica no tiene doctores registrados.");
        }
        if (doctores.size() > 1) {
            throw new ConflictException("Debes seleccionar un doctor para la cita.");
        }
        return doctores.get(0);
    }

    /** Duracion por defecto configurada en la clinica del tenant actual (fallback 30). */
    private int duracionPorDefecto() {
        Long tenantId = SecurityUtil.currentTenantId();
        if (tenantId == null) return 30;
        return clinicaRepository.findById(tenantId)
                .map(Clinica::getDuracionCitaDefault)
                .orElse(30);
    }

    @Transactional
    public CitaRecord cambiarEstado(Long id, EstadoCita nuevo) {
        Cita cita = buscar(id);
        cita.setEstado(nuevo);
        return CitaRecord.from(citaRepository.save(cita));
    }

    @Transactional
    public CitaRecord reagendar(Long id, LocalDate fecha, LocalTime horaInicio, Integer duracionMin) {
        Cita cita = buscar(id);
        int dur = duracionMin != null ? duracionMin : cita.getDuracionMin();
        LocalTime fin = horaInicio.plusMinutes(dur);
        validarSolape(cita.getDoctor().getId(), fecha, horaInicio, fin, cita.getId());
        cita.setFecha(fecha);
        cita.setHoraInicio(horaInicio);
        cita.setHoraFin(fin);
        cita.setDuracionMin(dur);
        cita.setEstado(EstadoCita.AGENDADA);
        return CitaRecord.from(citaRepository.save(cita));
    }

    // ---- Reglas ----

    /** Regla 1: un doctor no puede tener dos citas solapadas. */
    private void validarSolape(Long doctorId, LocalDate fecha, LocalTime inicio, LocalTime fin, Long excluirCitaId) {
        for (Cita c : citaRepository.findDelDoctorEnFecha(doctorId, fecha)) {
            if (excluirCitaId != null && c.getId().equals(excluirCitaId)) continue;
            boolean solapa = inicio.isBefore(c.getHoraFin()) && c.getHoraInicio().isBefore(fin);
            if (solapa) {
                throw new ConflictException("El doctor ya tiene una cita en ese horario.");
            }
        }
    }

    /** Regla 2: slots libres (>= 30 min) entre citas, dentro del horario de la clinica. */
    private List<SlotLibreRecord> calcularSlots(List<Cita> citasDelDia) {
        Long tenantId = SecurityUtil.currentTenantId();
        if (tenantId == null) return List.of();
        Clinica clinica = clinicaRepository.findById(tenantId).orElse(null);
        if (clinica == null) return List.of();

        LocalTime apertura = clinica.getHoraApertura();
        LocalTime cierre = clinica.getHoraCierre();

        List<Cita> ocupadas = citasDelDia.stream()
                .sorted(Comparator.comparing(Cita::getHoraInicio))
                .toList();

        List<SlotLibreRecord> slots = new ArrayList<>();
        LocalTime cursor = apertura;
        for (Cita c : ocupadas) {
            if (c.getHoraInicio().isAfter(cursor)) {
                agregarSlotSiAplica(slots, cursor, c.getHoraInicio());
            }
            if (c.getHoraFin().isAfter(cursor)) cursor = c.getHoraFin();
        }
        if (cursor.isBefore(cierre)) {
            agregarSlotSiAplica(slots, cursor, cierre);
        }
        return slots;
    }

    private void agregarSlotSiAplica(List<SlotLibreRecord> slots, LocalTime ini, LocalTime fin) {
        int min = (int) java.time.Duration.between(ini, fin).toMinutes();
        if (min >= SLOT_MINIMO_MIN) {
            slots.add(new SlotLibreRecord(ini, fin, min));
        }
    }

    private String nombrePaciente(Paciente p) {
        return (p.getNombre() + " " + (p.getApellidos() != null ? p.getApellidos() : "")).trim();
    }

    private Cita buscar(Long id) {
        Cita c = citaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        if (!SecurityUtil.perteneceAlTenant(c)) throw new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO);
        return c;
    }
}

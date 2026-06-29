package com.careone.api.core.pago;

import com.careone.api.core.paciente.Paciente;
import com.careone.api.core.paciente.PacienteRepository;
import com.careone.api.core.tratamiento.Tratamiento;
import com.careone.api.core.tratamiento.TratamientoRepository;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import com.careone.api.util.enums.MetodoPago;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PacienteRepository pacienteRepository;
    private final TratamientoRepository tratamientoRepository;

    public PagoService(PagoRepository pagoRepository, PacienteRepository pacienteRepository,
                       TratamientoRepository tratamientoRepository) {
        this.pagoRepository = pagoRepository;
        this.pacienteRepository = pacienteRepository;
        this.tratamientoRepository = tratamientoRepository;
    }

    @Transactional(readOnly = true)
    public List<PagoRecord> listarPorPaciente(Long pacienteId) {
        validarPaciente(pacienteId);
        return pagoRepository.findByPacienteIdOrderByFechaDesc(pacienteId).stream()
                .map(PagoRecord::from).toList();
    }

    /** Anti-IDOR: el paciente debe existir en el tenant actual (findById no se filtra). */
    private void validarPaciente(Long pacienteId) {
        Paciente p = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        if (!SecurityUtil.perteneceAlTenant(p)) throw new NotFoundException("El paciente no existe.");
    }

    @Transactional
    public PagoRecord registrar(RegistrarPagoRequest req) {
        Paciente paciente = pacienteRepository.findById(req.pacienteId())
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        if (!SecurityUtil.perteneceAlTenant(paciente)) throw new NotFoundException("El paciente no existe.");
        Pago p = new Pago();
        p.setPaciente(paciente);
        if (req.tratamientoId() != null) {
            Tratamiento t = tratamientoRepository.findById(req.tratamientoId())
                    .orElseThrow(() -> new NotFoundException("El tratamiento no existe."));
            if (!SecurityUtil.perteneceAlTenant(t)) throw new NotFoundException("El tratamiento no existe.");
            p.setTratamiento(t);
        }
        p.setCitaId(req.citaId());
        p.setMonto(req.monto());
        p.setMetodo(req.metodo() != null ? req.metodo() : MetodoPago.EFECTIVO);
        p.setConcepto(req.concepto());
        p.setFecha(req.fecha() != null ? req.fecha() : LocalDate.now());
        return PagoRecord.from(pagoRepository.save(p));
    }
}

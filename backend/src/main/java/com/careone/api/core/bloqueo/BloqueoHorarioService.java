package com.careone.api.core.bloqueo;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.doctor.DoctorRepository;
import com.careone.api.exception.ConflictException;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Bloqueos de horario de la clinica. Ver {@link BloqueoHorario}. */
@Service
public class BloqueoHorarioService {

    private final BloqueoHorarioRepository repository;
    private final DoctorRepository doctorRepository;

    public BloqueoHorarioService(BloqueoHorarioRepository repository, DoctorRepository doctorRepository) {
        this.repository = repository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<BloqueoHorarioRecord> delDia(LocalDate fecha) {
        return repository.findByFechaOrderByHoraInicioAsc(fecha).stream()
                .map(BloqueoHorarioRecord::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BloqueoHorarioRecord> enRango(LocalDate desde, LocalDate hasta) {
        return repository.findByFechaBetweenOrderByFechaAscHoraInicioAsc(desde, hasta).stream()
                .map(BloqueoHorarioRecord::from).toList();
    }

    @Transactional
    public BloqueoHorarioRecord crear(CrearBloqueoRequest req) {
        if (!req.horaFin().isAfter(req.horaInicio())) {
            throw new ConflictException("La hora de fin debe ser posterior a la de inicio.");
        }
        BloqueoHorario b = new BloqueoHorario();
        b.setTenantId(SecurityUtil.currentTenantId());
        if (req.doctorId() != null) {
            Doctor doctor = doctorRepository.findById(req.doctorId())
                    .orElseThrow(() -> new NotFoundException("El doctor no existe."));
            if (!SecurityUtil.perteneceAlTenant(doctor)) throw new NotFoundException("El doctor no existe.");
            b.setDoctor(doctor);
        }
        b.setFecha(req.fecha());
        b.setHoraInicio(req.horaInicio());
        b.setHoraFin(req.horaFin());
        b.setMotivo(req.motivo());
        return BloqueoHorarioRecord.from(repository.save(b));
    }

    @Transactional
    public void eliminar(Long id) {
        BloqueoHorario b = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("El bloqueo no existe."));
        if (!SecurityUtil.perteneceAlTenant(b)) throw new NotFoundException("El bloqueo no existe.");
        repository.delete(b);
    }
}

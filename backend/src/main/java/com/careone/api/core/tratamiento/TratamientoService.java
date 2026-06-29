package com.careone.api.core.tratamiento;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.doctor.DoctorRepository;
import com.careone.api.core.paciente.Paciente;
import com.careone.api.core.paciente.PacienteRepository;
import com.careone.api.core.pago.PagoRepository;
import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TratamientoService {

    private final TratamientoRepository tratamientoRepository;
    private final PacienteRepository pacienteRepository;
    private final DoctorRepository doctorRepository;
    private final PagoRepository pagoRepository;

    public TratamientoService(TratamientoRepository tratamientoRepository,
                              PacienteRepository pacienteRepository,
                              DoctorRepository doctorRepository,
                              PagoRepository pagoRepository) {
        this.tratamientoRepository = tratamientoRepository;
        this.pacienteRepository = pacienteRepository;
        this.doctorRepository = doctorRepository;
        this.pagoRepository = pagoRepository;
    }

    @Transactional(readOnly = true)
    public List<TratamientoRecord> listarPorPaciente(Long pacienteId) {
        var pac = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        if (!SecurityUtil.perteneceAlTenant(pac)) throw new NotFoundException("El paciente no existe.");
        return tratamientoRepository.findByPacienteIdOrderByIdDesc(pacienteId).stream()
                .map(t -> TratamientoRecord.from(t, pagoRepository.totalPagadoTratamiento(t.getId())))
                .toList();
    }

    @Transactional
    public TratamientoRecord crear(GuardarTratamientoRequest req) {
        Paciente paciente = pacienteRepository.findById(req.pacienteId())
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        if (!SecurityUtil.perteneceAlTenant(paciente)) throw new NotFoundException("El paciente no existe.");
        Tratamiento t = new Tratamiento();
        t.setPaciente(paciente);
        aplicar(t, req);
        t = tratamientoRepository.save(t);
        return TratamientoRecord.from(t, BigDecimal.ZERO);
    }

    @Transactional
    public TratamientoRecord actualizar(Long id, GuardarTratamientoRequest req) {
        Tratamiento t = tratamientoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        if (!SecurityUtil.perteneceAlTenant(t)) throw new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO);
        aplicar(t, req);
        t = tratamientoRepository.save(t);
        return TratamientoRecord.from(t, pagoRepository.totalPagadoTratamiento(t.getId()));
    }

    private void aplicar(Tratamiento t, GuardarTratamientoRequest req) {
        t.setNombre(req.nombre());
        t.setTotal(req.total());
        if (req.sesionesTotal() != null) t.setSesionesTotal(req.sesionesTotal());
        if (req.sesionesHechas() != null) t.setSesionesHechas(req.sesionesHechas());
        if (req.estado() != null) t.setEstado(req.estado());
        t.setInicio(req.inicio());
        t.setNotas(req.notas());
        if (req.doctorId() != null) {
            Doctor d = doctorRepository.findById(req.doctorId())
                    .orElseThrow(() -> new NotFoundException("El doctor no existe."));
            if (!SecurityUtil.perteneceAlTenant(d)) throw new NotFoundException("El doctor no existe.");
            t.setDoctor(d);
        } else {
            t.setDoctor(null);
        }
    }
}

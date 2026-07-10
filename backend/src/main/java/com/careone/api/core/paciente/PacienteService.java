package com.careone.api.core.paciente;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.doctor.DoctorRepository;
import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final DoctorRepository doctorRepository;

    public PacienteService(PacienteRepository pacienteRepository, DoctorRepository doctorRepository) {
        this.pacienteRepository = pacienteRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public Page<PacienteRecord> listar(String q, Pageable pageable) {
        Page<Paciente> page = (q == null || q.isBlank())
                ? pacienteRepository.findAll(pageable)
                : pacienteRepository.buscar(q.trim(), pageable);
        return page.map(PacienteRecord::from);
    }

    @Transactional(readOnly = true)
    public PacienteRecord obtener(Long id) {
        return PacienteRecord.from(buscar(id));
    }

    @Transactional
    public PacienteRecord crear(GuardarPacienteRequest req) {
        Paciente p = new Paciente();
        aplicar(p, req);
        p.setActivo(req.activo() == null || req.activo());
        return PacienteRecord.from(pacienteRepository.save(p));
    }

    @Transactional
    public PacienteRecord actualizar(Long id, GuardarPacienteRequest req) {
        Paciente p = buscar(id);
        aplicar(p, req);
        if (req.activo() != null) p.setActivo(req.activo());
        return PacienteRecord.from(pacienteRepository.save(p));
    }

    private void aplicar(Paciente p, GuardarPacienteRequest req) {
        p.setNombre(req.nombre());
        p.setApellidos(req.apellidos());
        p.setTelefono(req.telefono());
        p.setEmail(req.email());
        p.setFechaNacimiento(req.fechaNacimiento());
        p.setSexo(req.sexo());
        p.setOcupacion(req.ocupacion());
        p.setTipoSangre(req.tipoSangre());
        p.setDireccion(req.direccion());
        p.setAlergias(req.alergias());
        p.setNotas(req.notas());
        p.setEmergenciaNombre(req.emergenciaNombre());
        p.setEmergenciaParentesco(req.emergenciaParentesco());
        p.setEmergenciaTelefono(req.emergenciaTelefono());
        p.setDoctor(resolverDoctor(req.doctorId()));
    }

    private Doctor resolverDoctor(Long doctorId) {
        if (doctorId == null) return null;
        Doctor d = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("El doctor no existe."));
        if (!SecurityUtil.perteneceAlTenant(d)) throw new NotFoundException("El doctor no existe.");
        return d;
    }

    private Paciente buscar(Long id) {
        Paciente p = pacienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        // Anti-IDOR: findById NO pasa por el filtro de tenant de Hibernate.
        if (!SecurityUtil.perteneceAlTenant(p)) throw new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO);
        return p;
    }
}

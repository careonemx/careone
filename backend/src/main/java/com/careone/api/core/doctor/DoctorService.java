package com.careone.api.core.doctor;

import com.careone.api.core.especialidad.Especialidad;
import com.careone.api.core.especialidad.EspecialidadRepository;
import com.careone.api.core.rol.Rol;
import com.careone.api.core.rol.RolRepository;
import com.careone.api.core.usuario.Usuario;
import com.careone.api.core.usuario.UsuarioRepository;
import com.careone.api.exception.ConflictException;
import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import com.careone.api.util.enums.RolNombre;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final EspecialidadRepository especialidadRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository,
                         UsuarioRepository usuarioRepository,
                         RolRepository rolRepository,
                         EspecialidadRepository especialidadRepository,
                         PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.especialidadRepository = especialidadRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<DoctorRecord> listar() {
        return doctorRepository.findAllByOrderByIdAsc().stream().map(DoctorRecord::from).toList();
    }

    @Transactional
    public DoctorRecord crear(CrearDoctorRequest req) {
        Long tenantId = SecurityUtil.currentTenantId();
        if (req.password() == null || req.password().isBlank()) {
            throw new ConflictException("La contrasena es obligatoria al crear un doctor.");
        }
        if (usuarioRepository.existsByEmailIgnoreCaseAndTenantId(req.email(), tenantId)) {
            throw new ConflictException("Ya existe un usuario con ese email en la clinica.");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(req.email());
        usuario.setNombre(req.nombre());
        usuario.setApellidos(req.apellidos());
        usuario.setTelefono(req.telefono());
        usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        usuario.setActivo(req.activo() == null || req.activo());
        usuario.getRoles().add(rolDoctor());
        // tenant_id lo asigna TenantEntityListener desde el TenantContext.
        usuario = usuarioRepository.save(usuario);

        Doctor doctor = new Doctor();
        doctor.setUsuario(usuario);
        doctor.setCedula(req.cedula());
        doctor.setEspecialidad(resolverEspecialidad(req.especialidadId()));
        doctor.setActivo(usuario.isActivo());
        return DoctorRecord.from(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorRecord actualizar(Long id, CrearDoctorRequest req) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        Usuario usuario = doctor.getUsuario();

        usuario.setNombre(req.nombre());
        usuario.setApellidos(req.apellidos());
        usuario.setTelefono(req.telefono());
        if (req.activo() != null) {
            usuario.setActivo(req.activo());
            doctor.setActivo(req.activo());
        }
        if (req.password() != null && !req.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        doctor.setCedula(req.cedula());
        doctor.setEspecialidad(resolverEspecialidad(req.especialidadId()));
        return DoctorRecord.from(doctorRepository.save(doctor));
    }

    private Especialidad resolverEspecialidad(Long especialidadId) {
        if (especialidadId == null) {
            return null;
        }
        return especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new NotFoundException("La especialidad no existe."));
    }

    private Rol rolDoctor() {
        return rolRepository.findByNombre(RolNombre.DOCTOR)
                .orElseThrow(() -> new IllegalStateException("Rol DOCTOR no sembrado."));
    }
}

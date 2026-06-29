package com.careone.api.core.recepcionista;

import com.careone.api.core.doctor.Doctor;
import com.careone.api.core.doctor.DoctorRepository;
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
public class RecepcionistaService {

    private final RecepcionistaRepository recepcionistaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public RecepcionistaService(RecepcionistaRepository recepcionistaRepository,
                                UsuarioRepository usuarioRepository,
                                RolRepository rolRepository,
                                DoctorRepository doctorRepository,
                                PasswordEncoder passwordEncoder) {
        this.recepcionistaRepository = recepcionistaRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<RecepcionistaRecord> listar() {
        return recepcionistaRepository.findAllByOrderByIdAsc().stream()
                .map(RecepcionistaRecord::from).toList();
    }

    @Transactional
    public RecepcionistaRecord crear(CrearRecepcionistaRequest req) {
        Long tenantId = SecurityUtil.currentTenantId();
        if (req.password() == null || req.password().isBlank()) {
            throw new ConflictException("La contrasena es obligatoria al crear una recepcionista.");
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
        usuario.getRoles().add(rolRecepcionista());
        usuario = usuarioRepository.save(usuario);

        Recepcionista recep = new Recepcionista();
        recep.setUsuario(usuario);
        recep.setDoctor(resolverDoctor(req.doctorId()));
        recep.setActivo(usuario.isActivo());
        return RecepcionistaRecord.from(recepcionistaRepository.save(recep));
    }

    @Transactional
    public RecepcionistaRecord actualizar(Long id, CrearRecepcionistaRequest req) {
        Recepcionista recep = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        Usuario usuario = recep.getUsuario();

        usuario.setNombre(req.nombre());
        usuario.setApellidos(req.apellidos());
        usuario.setTelefono(req.telefono());
        if (req.activo() != null) {
            usuario.setActivo(req.activo());
            recep.setActivo(req.activo());
        }
        if (req.password() != null && !req.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        recep.setDoctor(resolverDoctor(req.doctorId()));
        return RecepcionistaRecord.from(recepcionistaRepository.save(recep));
    }

    private Doctor resolverDoctor(Long doctorId) {
        if (doctorId == null) {
            return null; // compartida
        }
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("El doctor asignado no existe."));
    }

    private Rol rolRecepcionista() {
        return rolRepository.findByNombre(RolNombre.RECEPCIONISTA)
                .orElseThrow(() -> new IllegalStateException("Rol RECEPCIONISTA no sembrado."));
    }
}

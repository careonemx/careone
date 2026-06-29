package com.careone.api.core.ayudante;

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
public class AyudanteService {

    private final AyudanteRepository ayudanteRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public AyudanteService(AyudanteRepository ayudanteRepository,
                           UsuarioRepository usuarioRepository,
                           RolRepository rolRepository,
                           DoctorRepository doctorRepository,
                           PasswordEncoder passwordEncoder) {
        this.ayudanteRepository = ayudanteRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AyudanteRecord> listar() {
        return ayudanteRepository.findAllByOrderByIdAsc().stream().map(AyudanteRecord::from).toList();
    }

    @Transactional
    public AyudanteRecord crear(CrearAyudanteRequest req) {
        Long tenantId = SecurityUtil.currentTenantId();
        if (req.password() == null || req.password().isBlank()) {
            throw new ConflictException("La contrasena es obligatoria al crear un ayudante.");
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
        usuario.getRoles().add(rolAyudante());
        usuario = usuarioRepository.save(usuario);

        Ayudante ayudante = new Ayudante();
        ayudante.setUsuario(usuario);
        ayudante.setDoctor(buscarDoctor(req.doctorId()));
        ayudante.setActivo(usuario.isActivo());
        return AyudanteRecord.from(ayudanteRepository.save(ayudante));
    }

    @Transactional
    public AyudanteRecord actualizar(Long id, CrearAyudanteRequest req) {
        Ayudante ayudante = ayudanteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        Usuario usuario = ayudante.getUsuario();

        usuario.setNombre(req.nombre());
        usuario.setApellidos(req.apellidos());
        usuario.setTelefono(req.telefono());
        if (req.activo() != null) {
            usuario.setActivo(req.activo());
            ayudante.setActivo(req.activo());
        }
        if (req.password() != null && !req.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        ayudante.setDoctor(buscarDoctor(req.doctorId()));
        return AyudanteRecord.from(ayudanteRepository.save(ayudante));
    }

    private Doctor buscarDoctor(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NotFoundException("El doctor asignado no existe."));
    }

    private Rol rolAyudante() {
        return rolRepository.findByNombre(RolNombre.AYUDANTE)
                .orElseThrow(() -> new IllegalStateException("Rol AYUDANTE no sembrado."));
    }
}

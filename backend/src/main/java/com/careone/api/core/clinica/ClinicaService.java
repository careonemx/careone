package com.careone.api.core.clinica;

import com.careone.api.core.especialidad.Especialidad;
import com.careone.api.core.especialidad.EspecialidadRepository;
import com.careone.api.core.rol.Rol;
import com.careone.api.core.rol.RolRepository;
import com.careone.api.core.tipocita.TipoCita;
import com.careone.api.core.tipocita.TipoCitaRepository;
import com.careone.api.core.usuario.Usuario;
import com.careone.api.core.usuario.UsuarioRepository;
import com.careone.api.exception.ConflictException;
import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
import com.careone.api.util.enums.RolNombre;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gestion de clinicas (tenants). SOLO para el SUPERADMIN: alta, edicion y
 * activacion/desactivacion. Clinica no es tenant-aware (es la raiz del tenant),
 * por lo que aqui no aplica el filtro automatico.
 */
@Service
public class ClinicaService {

    private final ClinicaRepository clinicaRepository;
    private final EspecialidadRepository especialidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TipoCitaRepository tipoCitaRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.careone.api.core.doctor.DoctorRepository doctorRepository;

    public ClinicaService(ClinicaRepository clinicaRepository,
                          EspecialidadRepository especialidadRepository,
                          UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          TipoCitaRepository tipoCitaRepository,
                          PasswordEncoder passwordEncoder,
                          com.careone.api.core.doctor.DoctorRepository doctorRepository) {
        this.clinicaRepository = clinicaRepository;
        this.especialidadRepository = especialidadRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.tipoCitaRepository = tipoCitaRepository;
        this.passwordEncoder = passwordEncoder;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public Page<ClinicaRecord> listar(String filtroNombre, Pageable pageable) {
        Page<Clinica> page = (filtroNombre == null || filtroNombre.isBlank())
                ? clinicaRepository.findAll(pageable)
                : clinicaRepository.findAllByNombreContainingIgnoreCase(filtroNombre, pageable);
        return page.map(ClinicaRecord::from);
    }

    @Transactional(readOnly = true)
    public ClinicaRecord obtener(Long id) {
        return ClinicaRecord.from(buscar(id));
    }

    @Transactional
    public ClinicaRecord crear(CrearClinicaRequest req) {
        Especialidad esp = especialidadRepository.findById(req.especialidadId())
                .orElseThrow(() -> new NotFoundException("La especialidad no existe."));

        Clinica c = new Clinica();
        c.setEspecialidad(esp);
        aplicar(c, req);
        c.setActivo(req.activo() == null || req.activo());
        c = clinicaRepository.save(c);

        // Sembrar el catalogo base de tipos de cita para la nueva clinica.
        sembrarTiposCita(c.getId());

        // Si se enviaron credenciales, crear el primer ADMIN_CLINICA de esta clinica.
        if (req.adminEmail() != null && !req.adminEmail().isBlank()) {
            crearAdminClinica(c.getId(), req);
        }
        return ClinicaRecord.from(c);
    }

    /**
     * Siembra los 4 tipos de cita por defecto. El SUPERADMIN no tiene tenant en
     * contexto, asi que asignamos fn_tenant_id explicitamente.
     */
    private void sembrarTiposCita(Long clinicaId) {
        record Def(String nombre, int dur) {}
        List<Def> defaults = List.of(
                new Def("Primera vez", 60), new Def("Seguimiento", 30),
                new Def("Revision", 30), new Def("Urgencia", 45));
        for (Def d : defaults) {
            TipoCita t = new TipoCita();
            t.setTenantId(clinicaId);
            t.setNombre(d.nombre());
            t.setDuracionDefault(d.dur());
            t.setActivo(true);
            tipoCitaRepository.save(t);
        }
    }

    /**
     * Crea el usuario ADMIN_CLINICA de una clinica recien creada. El SUPERADMIN
     * NO tiene tenant en contexto, asi que asignamos el tenant_id explicitamente
     * (= id de la nueva clinica); el listener de tenant no aplicaria aqui.
     */
    private void crearAdminClinica(Long clinicaId, CrearClinicaRequest req) {
        if (req.adminPassword() == null || req.adminPassword().isBlank()) {
            throw new ConflictException("La contrasena del administrador es obligatoria.");
        }
        if (usuarioRepository.existsByEmailIgnoreCaseAndTenantId(req.adminEmail(), clinicaId)) {
            throw new ConflictException("Ya existe un usuario con ese email en la clinica.");
        }
        Rol rolAdmin = rolRepository.findByNombre(RolNombre.ADMIN_CLINICA)
                .orElseThrow(() -> new IllegalStateException("Rol ADMIN_CLINICA no sembrado."));

        Usuario admin = new Usuario();
        admin.setTenantId(clinicaId); // explicito: el SUPERADMIN no tiene tenant en contexto
        admin.setEmail(req.adminEmail());
        admin.setNombre(req.adminNombre() != null && !req.adminNombre().isBlank()
                ? req.adminNombre() : "Administrador");
        admin.setPasswordHash(passwordEncoder.encode(req.adminPassword()));
        admin.setActivo(true);
        admin.getRoles().add(rolAdmin);
        usuarioRepository.save(admin);

        // El ADMIN_CLINICA también es doctor disponible para atender en su propia clínica.
        Clinica clinica = clinicaRepository.findById(clinicaId)
                .orElseThrow(() -> new IllegalStateException("Clinica no encontrada."));
        com.careone.api.core.doctor.Doctor doctor = new com.careone.api.core.doctor.Doctor();
        doctor.setTenantId(clinicaId);
        doctor.setUsuario(admin);
        doctor.setEspecialidad(clinica.getEspecialidad());
        doctor.setActivo(true);
        doctorRepository.save(doctor);
    }

    @Transactional
    public ClinicaRecord actualizar(Long id, CrearClinicaRequest req) {
        Clinica c = buscar(id);
        if (!c.getEspecialidad().getId().equals(req.especialidadId())) {
            Especialidad esp = especialidadRepository.findById(req.especialidadId())
                    .orElseThrow(() -> new NotFoundException("La especialidad no existe."));
            c.setEspecialidad(esp);
        }
        aplicar(c, req);
        if (req.activo() != null) {
            c.setActivo(req.activo());
        }
        return ClinicaRecord.from(clinicaRepository.save(c));
    }

    @Transactional
    public ClinicaRecord cambiarEstado(Long id, boolean activo) {
        Clinica c = buscar(id);
        c.setActivo(activo);
        return ClinicaRecord.from(clinicaRepository.save(c));
    }

    private void aplicar(Clinica c, CrearClinicaRequest req) {
        c.setNombre(req.nombre());
        c.setRfc(req.rfc());
        c.setTelefono(req.telefono());
        c.setEmail(req.email());
        c.setDireccion(req.direccion());
        c.setHoraApertura(req.horaApertura() != null ? req.horaApertura() : LocalTime.of(8, 0));
        c.setHoraCierre(req.horaCierre() != null ? req.horaCierre() : LocalTime.of(18, 0));
    }

    private Clinica buscar(Long id) {
        return clinicaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
    }
}

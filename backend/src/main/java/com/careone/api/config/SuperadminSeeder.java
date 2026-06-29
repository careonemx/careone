package com.careone.api.config;

import com.careone.api.core.rol.Rol;
import com.careone.api.core.rol.RolRepository;
import com.careone.api.core.usuario.Usuario;
import com.careone.api.core.usuario.UsuarioRepository;
import com.careone.api.util.enums.RolNombre;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Siembra el usuario SUPERADMIN al arrancar, si no existe. Credenciales por
 * variables de entorno (.env). El SUPERADMIN no tiene tenant (global).
 */
@Component
public class SuperadminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperadminSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${careone.superadmin.email}")
    private String superadminEmail;

    @Value("${careone.superadmin.password}")
    private String superadminPassword;

    public SuperadminSeeder(UsuarioRepository usuarioRepository,
                            RolRepository rolRepository,
                            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.existsByEmailIgnoreCase(superadminEmail)) {
            return;
        }
        Rol rolSuperadmin = rolRepository.findByNombre(RolNombre.SUPERADMIN)
                .orElseThrow(() -> new IllegalStateException(
                        "Rol SUPERADMIN no sembrado: revisa la migracion V1."));

        Usuario superadmin = new Usuario();
        superadmin.setTenantId(null); // global
        superadmin.setEmail(superadminEmail);
        superadmin.setPasswordHash(passwordEncoder.encode(superadminPassword));
        superadmin.setNombre("Super Administrador");
        superadmin.setActivo(true);
        superadmin.getRoles().add(rolSuperadmin);

        usuarioRepository.save(superadmin);
        log.info("SUPERADMIN sembrado: {}", superadminEmail);
    }
}

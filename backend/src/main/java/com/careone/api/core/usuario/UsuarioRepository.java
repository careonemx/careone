package com.careone.api.core.usuario;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca por email (case-insensitive). Se usa en login, cuando aun no hay
     * tenant activo, por lo que el filtro de Hibernate esta deshabilitado y la
     * busqueda es global. La unicidad de email por tenant la garantiza la BD.
     */
    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /** Duplicado de email dentro de un tenant concreto (alta de personal de clinica). */
    boolean existsByEmailIgnoreCaseAndTenantId(String email, Long tenantId);
}

package com.careone.api.core.rol;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolPermisoRepository extends JpaRepository<RolPermiso, Long> {

    /** Reglas base del sistema (sin tenant). */
    List<RolPermiso> findByTenantIdIsNull();

    /** Reglas base de un rol concreto. */
    List<RolPermiso> findByRolIdAndTenantIdIsNull(Long rolId);

    /** Overrides de una clinica. */
    List<RolPermiso> findByTenantId(Long tenantId);

    /** Override concreto (rol+permiso) de una clinica, si existe. */
    Optional<RolPermiso> findByRolIdAndPermisoIdAndTenantId(Long rolId, Long permisoId, Long tenantId);
}

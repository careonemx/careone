package com.careone.api.tenant;

import jakarta.persistence.PrePersist;

/**
 * Listener JPA que asigna el {@code tenant_id} automaticamente al persistir
 * cualquier entidad {@link TenantAware}.
 *
 * <p>Capa 3 del aislamiento: garantiza que nadie pueda escribir un registro en
 * un tenant distinto al del usuario autenticado. Si la entidad ya trae un tenant
 * asignado (caso del SUPERADMIN creando datos de una clinica concreta, controlado
 * por servicio), se respeta; en caso contrario se toma del {@link TenantContext}.
 *
 * <p>Se declara en cada entidad con {@code @EntityListeners(TenantEntityListener.class)}.
 */
public class TenantEntityListener {

    @PrePersist
    public void setTenantOnPersist(Object entity) {
        if (entity instanceof TenantAware aware && aware.getTenantId() == null) {
            Long tenantId = TenantContext.getTenantId();
            if (tenantId != null) {
                aware.setTenantId(tenantId);
            }
        }
    }
}

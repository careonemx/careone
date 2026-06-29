package com.careone.api.tenant;

/**
 * Marca una entidad JPA como perteneciente a un tenant (clinica).
 *
 * <p>Las entidades de NEGOCIO (usuario de clinica, paciente, cita, doctor, etc.)
 * implementan esta interfaz. Las entidades de catalogo GLOBAL (especialidad, rol,
 * permiso) NO la implementan: son compartidas por todos los tenants.
 *
 * <p>{@link TenantEntityListener} usa el setter para asignar el tenant al
 * persistir, y el filtro de Hibernate ({@link TenantFilterConfigurer}) usa la
 * columna {@code tenant_id} para aislar las lecturas.
 */
public interface TenantAware {

    Long getTenantId();

    void setTenantId(Long tenantId);
}

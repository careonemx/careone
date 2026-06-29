package com.careone.api.tenant;

/**
 * Contexto de tenant por request (ThreadLocal).
 *
 * <p>Guarda el {@code tenant_id} (= clinica_id) del usuario autenticado durante
 * el ciclo de vida del request. Lo llena {@link TenantFilter} a partir del claim
 * del JWT y se limpia al final del request para evitar fugas entre requests que
 * reutilizan el mismo hilo del pool de Tomcat.
 *
 * <p>Un valor {@code null} significa "sin tenant": es el caso del SUPERADMIN
 * (global). En ese caso el filtro de Hibernate NO se activa, pero el SUPERADMIN
 * no tiene acceso a endpoints de datos clinicos (se controla por rol/permiso).
 */
public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setTenantId(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static Long getTenantId() {
        return CURRENT_TENANT.get();
    }

    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}

package com.careone.api.security;

import com.careone.api.tenant.TenantAware;
import com.careone.api.tenant.TenantContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilidades para acceder al usuario/tenant autenticado de forma segura.
 */
public final class SecurityUtil {

    private SecurityUtil() {
    }

    /** Id del usuario autenticado (subject del JWT), o null si no hay sesion. */
    public static Long currentUsuarioId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Long id) {
            return id;
        }
        return null;
    }

    /** Tenant del request actual (null para SUPERADMIN). */
    public static Long currentTenantId() {
        return TenantContext.getTenantId();
    }

    /**
     * Verifica que una entidad tenant-aware pertenece al tenant del request.
     *
     * <p>CRITICO anti-IDOR: el filtro de Hibernate NO se aplica a cargas por
     * clave primaria ({@code findById} / {@code em.find}), solo a queries
     * HQL/criteria. Por eso, tras cargar una entidad por id, hay que validar su
     * tenant explicitamente. Devuelve {@code false} si la entidad es de otro
     * tenant (el llamador debe tratarlo como "no encontrado").
     *
     * <p>Si no hay tenant en contexto (SUPERADMIN), no valida (acceso global,
     * controlado por rol).
     */
    public static boolean perteneceAlTenant(TenantAware entidad) {
        Long tenant = currentTenantId();
        if (tenant == null) {
            return true; // SUPERADMIN: sin restriccion de tenant aqui
        }
        return entidad != null && tenant.equals(entidad.getTenantId());
    }
}

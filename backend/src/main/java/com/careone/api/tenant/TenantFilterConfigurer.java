package com.careone.api.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

/**
 * Activa el filtro de Hibernate {@code tenantFilter} en la sesion actual con el
 * tenant del {@link TenantContext}.
 *
 * <p>Capa 2 del aislamiento. Una vez activado, Hibernate inyecta
 * {@code WHERE tenant_id = :tenantId} en TODA consulta sobre entidades que
 * declaren el filtro, aunque el repositorio o el Resource olviden filtrar.
 *
 * <p>El nombre del filtro y el parametro deben coincidir con la {@code @FilterDef}
 * declarada en las entidades {@link TenantAware} (se anaden en Fase 3):
 * <pre>
 * &#64;FilterDef(name = "tenantFilter",
 *            parameters = &#64;ParamDef(name = "tenantId", type = Long.class))
 * &#64;Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
 * </pre>
 */
@Component
public class TenantFilterConfigurer {

    public static final String FILTER_NAME = "tenantFilter";
    public static final String PARAM_NAME = "tenantId";

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Activa el filtro si hay tenant en contexto. Para el SUPERADMIN (sin tenant)
     * NO se activa: ve el catalogo global, pero no accede a endpoints clinicos.
     */
    public void enableForCurrentTenant() {
        Long tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return;
        }
        Session session = entityManager.unwrap(Session.class);
        session.enableFilter(FILTER_NAME).setParameter(PARAM_NAME, tenantId);
    }

    public void disable() {
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter(FILTER_NAME);
    }
}

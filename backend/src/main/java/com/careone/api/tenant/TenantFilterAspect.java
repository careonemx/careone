package com.careone.api.tenant;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Activa el filtro de Hibernate {@code tenantFilter} en los metodos de servicio
 * del paquete {@code core} (transaccionales), para que Hibernate aisle TODAS las
 * lecturas por tenant automaticamente.
 *
 * <p>CRITICO: este aspecto debe correr DENTRO de la transaccion (es decir, DESPUES
 * de que {@code @Transactional} abrio la sesion/transaccion). Por eso usa
 * {@code LOWEST_PRECEDENCE} (el advice mas interno). Si corriera mas externo,
 * el {@code enableFilter} se aplicaria a una sesion distinta de la que ejecuta el
 * query y el aislamiento NO surtiria efecto.
 *
 * <p>Si no hay tenant (SUPERADMIN), no activa el filtro: ve el catalogo global,
 * pero la seguridad por rol le impide acceder a endpoints de datos clinicos.
 */
@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class TenantFilterAspect {

    private final TenantFilterConfigurer configurer;

    public TenantFilterAspect(TenantFilterConfigurer configurer) {
        this.configurer = configurer;
    }

    @Around("execution(* com.careone.api.core..*Service.*(..))")
    public Object enableTenantFilter(ProceedingJoinPoint pjp) throws Throwable {
        if (TenantContext.hasTenant()) {
            configurer.enableForCurrentTenant();
        }
        return pjp.proceed();
    }
}

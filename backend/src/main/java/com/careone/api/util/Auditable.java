package com.careone.api.util;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/**
 * Superclase con campos de auditoria temporal (creado/actualizado).
 * Las entidades la extienden para heredar {@code creado_en} y {@code actualizado_en}.
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditableListener.class)
public abstract class Auditable {

    @Column(name = "d_creado_en", nullable = false, updatable = false)
    private Instant creadoEn;

    @Column(name = "d_actualizado_en", nullable = false)
    private Instant actualizadoEn;
}

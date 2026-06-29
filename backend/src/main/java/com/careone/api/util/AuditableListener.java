package com.careone.api.util;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;

/**
 * Asigna marcas de tiempo de auditoria a las entidades {@link Auditable}.
 */
public class AuditableListener {

    @PrePersist
    public void onPersist(Object entity) {
        if (entity instanceof Auditable auditable) {
            Instant now = Instant.now();
            auditable.setCreadoEn(now);
            auditable.setActualizadoEn(now);
        }
    }

    @PreUpdate
    public void onUpdate(Object entity) {
        if (entity instanceof Auditable auditable) {
            auditable.setActualizadoEn(Instant.now());
        }
    }
}

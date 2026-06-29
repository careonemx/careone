package com.careone.api.core.clinica;

import jakarta.validation.constraints.NotNull;

/** Activa o desactiva una clinica (accion del SUPERADMIN). */
public record EstadoClinicaRequest(
        @NotNull(message = "El estado es obligatorio.")
        Boolean activo
) {
}

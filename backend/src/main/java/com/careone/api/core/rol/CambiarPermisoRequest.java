package com.careone.api.core.rol;

import jakarta.validation.constraints.NotNull;

/** El ADMIN_CLINICA activa/desactiva un permiso para un rol en SU clinica. */
public record CambiarPermisoRequest(
        @NotNull(message = "El rol es obligatorio.") Long rolId,
        @NotNull(message = "El permiso es obligatorio.") Long permisoId,
        @NotNull(message = "El estado es obligatorio.") Boolean permitido
) {
}

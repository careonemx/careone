package com.careone.api.core.especialidad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTO de entrada para crear/editar especialidad. */
public record GuardarEspecialidadRequest(
        @NotBlank(message = "El codigo es obligatorio.")
        @Size(max = 40, message = "El codigo es demasiado largo.")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre es demasiado largo.")
        String nombre,

        Boolean activo
) {
}

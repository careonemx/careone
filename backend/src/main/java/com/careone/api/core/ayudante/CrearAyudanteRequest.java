package com.careone.api.core.ayudante;

import com.careone.api.util.Validaciones;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Alta de ayudante / practicante. Crea su usuario con rol AYUDANTE.
 * SIEMPRE ligado a un doctor ({@code doctorId} obligatorio).
 */
public record CrearAyudanteRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no puede exceder 120 caracteres.")
        String nombre,

        @Size(max = 120, message = "Los apellidos no pueden exceder 120 caracteres.")
        String apellidos,

        @NotBlank(message = "El email es obligatorio.")
        @Email(message = Validaciones.MSG_EMAIL)
        @Size(max = 160, message = "El email es demasiado largo.")
        String email,

        @Pattern(regexp = Validaciones.TELEFONO + "|^$", message = Validaciones.MSG_TELEFONO)
        @Size(max = 30, message = "El telefono es demasiado largo.")
        String telefono,

        @Size(min = 8, max = 72, message = "La contrasena debe tener entre 8 y 72 caracteres.")
        String password,

        @NotNull(message = "El doctor es obligatorio.")
        Long doctorId,
        Boolean activo
) {
}

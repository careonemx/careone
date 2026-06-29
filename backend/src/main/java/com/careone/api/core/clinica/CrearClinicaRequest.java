package com.careone.api.core.clinica;

import com.careone.api.util.Validaciones;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

/**
 * DTO de entrada para crear/editar una clinica (tenant). Lo usa el SUPERADMIN.
 */
public record CrearClinicaRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 160, message = "El nombre no puede exceder 160 caracteres.")
        String nombre,

        @NotNull(message = "La especialidad es obligatoria.")
        Long especialidadId,

        @Pattern(regexp = Validaciones.RFC + "|^$", message = Validaciones.MSG_RFC)
        @Size(max = 20, message = "El RFC es demasiado largo.")
        String rfc,

        @Pattern(regexp = Validaciones.TELEFONO + "|^$", message = Validaciones.MSG_TELEFONO)
        @Size(max = 30, message = "El telefono es demasiado largo.")
        String telefono,

        @Email(message = Validaciones.MSG_EMAIL)
        @Size(max = 160, message = "El email es demasiado largo.")
        String email,

        @Size(max = 400, message = "La direccion no puede exceder 400 caracteres.")
        String direccion,

        LocalTime horaApertura,
        LocalTime horaCierre,
        Boolean activo,

        // ---- Primer ADMIN_CLINICA de la clinica (solo en alta) ----
        @Email(message = "El email del administrador no tiene un formato valido.")
        @Size(max = 160, message = "El email del administrador es demasiado largo.")
        String adminEmail,

        @Size(max = 120, message = "El nombre del administrador es demasiado largo.")
        String adminNombre,

        @Size(min = 8, max = 72, message = "La contrasena del administrador debe tener entre 8 y 72 caracteres.")
        String adminPassword
) {
}

package com.careone.api.core.paciente;

import com.careone.api.util.Validaciones;
import com.careone.api.util.enums.Sexo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record GuardarPacienteRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no puede exceder 120 caracteres.")
        String nombre,

        @Size(max = 120, message = "Los apellidos no pueden exceder 120 caracteres.")
        String apellidos,

        @Pattern(regexp = Validaciones.TELEFONO + "|^$", message = Validaciones.MSG_TELEFONO)
        @Size(max = 30, message = "El telefono es demasiado largo.")
        String telefono,

        @Email(message = Validaciones.MSG_EMAIL)
        @Size(max = 160, message = "El email es demasiado largo.")
        String email,

        LocalDate fechaNacimiento,
        Sexo sexo,

        @Size(max = 120, message = "La ocupacion no puede exceder 120 caracteres.")
        String ocupacion,

        @Pattern(regexp = Validaciones.TIPO_SANGRE + "|^$", message = Validaciones.MSG_TIPO_SANGRE)
        String tipoSangre,

        @Size(max = 400, message = "La direccion no puede exceder 400 caracteres.")
        String direccion,

        @Size(max = 600, message = "Las alergias no pueden exceder 600 caracteres.")
        String alergias,

        @Size(max = 1000, message = "Las notas no pueden exceder 1000 caracteres.")
        String notas,

        @Size(max = 160, message = "El nombre del contacto es demasiado largo.")
        String emergenciaNombre,

        @Size(max = 60, message = "El parentesco es demasiado largo.")
        String emergenciaParentesco,

        @Pattern(regexp = Validaciones.TELEFONO + "|^$", message = Validaciones.MSG_TELEFONO)
        @Size(max = 30, message = "El telefono de emergencia es demasiado largo.")
        String emergenciaTelefono,

        Long doctorId,
        Boolean activo
) {
}

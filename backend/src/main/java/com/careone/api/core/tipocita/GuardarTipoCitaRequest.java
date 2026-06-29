package com.careone.api.core.tipocita;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record GuardarTipoCitaRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 80, message = "El nombre no puede exceder 80 caracteres.")
        String nombre,

        @Positive(message = "La duracion debe ser un numero positivo.")
        Integer duracionDefault,

        Boolean activo
) {
}

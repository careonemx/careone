package com.careone.api.core.historia;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record GuardarGinecoRequest(
        @PositiveOrZero(message = "Las gestas no pueden ser negativas.") Integer gestas,
        @PositiveOrZero(message = "Los partos no pueden ser negativos.") Integer partos,
        @PositiveOrZero(message = "Los abortos no pueden ser negativos.") Integer abortos,
        @Size(max = 60) String tiempoGestacion,
        @Size(max = 120) String metodoPlanificacion
) {
}

package com.careone.api.core.historia;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record GuardarHigieneRequest(
        @PositiveOrZero(message = "Los cepillados no pueden ser negativos.") Integer cepilladosDia,
        @Size(max = 40) String tipoCepillo,
        Boolean usaHilo,
        Boolean usaEnjuague
) {
}

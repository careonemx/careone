package com.careone.api.core.odontograma;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuardarDienteRequest(
        @NotNull Integer fdi,
        @NotNull @Size(max = 20) String estado,
        Boolean brackets,
        @Size(max = 200) String nota
) {
}

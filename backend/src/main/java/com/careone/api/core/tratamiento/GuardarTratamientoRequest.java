package com.careone.api.core.tratamiento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record GuardarTratamientoRequest(
        @NotNull(message = "El paciente es obligatorio.") Long pacienteId,
        @NotBlank(message = "El nombre es obligatorio.") @Size(max = 200) String nombre,
        @NotNull @PositiveOrZero BigDecimal total,
        Integer sesionesTotal,
        Integer sesionesHechas,
        String estado,
        LocalDate inicio,
        Long doctorId,
        @Size(max = 600) String notas
) {
}

package com.careone.api.core.pago;

import com.careone.api.util.enums.MetodoPago;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RegistrarPagoRequest(
        @NotNull(message = "El paciente es obligatorio.") Long pacienteId,
        Long tratamientoId,
        Long citaId,
        @NotNull @Positive(message = "El monto debe ser positivo.") BigDecimal monto,
        MetodoPago metodo,
        @Size(max = 200) String concepto,
        LocalDate fecha
) {
}

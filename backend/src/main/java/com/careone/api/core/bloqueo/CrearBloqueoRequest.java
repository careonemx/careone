package com.careone.api.core.bloqueo;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Crea un bloqueo de horario. doctorId opcional (null = bloqueo general de la clinica).
 */
public record CrearBloqueoRequest(
        Long doctorId,
        @NotNull(message = "La fecha es obligatoria.") LocalDate fecha,
        @NotNull(message = "La hora de inicio es obligatoria.") LocalTime horaInicio,
        @NotNull(message = "La hora de fin es obligatoria.") LocalTime horaFin,
        @Size(max = 200, message = "El motivo es demasiado largo.") String motivo
) {
}

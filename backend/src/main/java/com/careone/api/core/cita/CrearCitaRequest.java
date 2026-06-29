package com.careone.api.core.cita;

import com.careone.api.util.enums.CanalConfirmacion;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record CrearCitaRequest(
        @NotNull(message = "El paciente es obligatorio.") Long pacienteId,
        @NotNull(message = "El doctor es obligatorio.") Long doctorId,
        Long tipoCitaId,
        @Size(max = 200, message = "El tratamiento es demasiado largo.") String tratamiento,
        @Size(max = 400, message = "El motivo es demasiado largo.") String motivo,
        @NotNull(message = "La fecha es obligatoria.") LocalDate fecha,
        @NotNull(message = "La hora es obligatoria.") LocalTime horaInicio,
        @NotNull(message = "La duracion es obligatoria.")
        @Positive(message = "La duracion debe ser un numero positivo.") Integer duracionMin,
        BigDecimal monto,
        CanalConfirmacion canalConfirmacion,
        Boolean recordatorioWhatsapp,
        @Size(max = 600, message = "Las notas son demasiado largas.") String notas
) {
}

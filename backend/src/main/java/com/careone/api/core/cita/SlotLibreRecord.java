package com.careone.api.core.cita;

import java.time.LocalTime;

/** Espacio libre entre citas (>= 30 min), calculado desde el horario de la clinica. */
public record SlotLibreRecord(LocalTime horaInicio, LocalTime horaFin, int minutos) {
}

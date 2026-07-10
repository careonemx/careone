package com.careone.api.core.bloqueo;

import java.time.LocalDate;
import java.time.LocalTime;

/** Bloqueo de horario devuelto a la agenda. */
public record BloqueoHorarioRecord(
        Long id,
        Long doctorId,
        String doctorNombre,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        String motivo
) {
    public static BloqueoHorarioRecord from(BloqueoHorario b) {
        return new BloqueoHorarioRecord(
                b.getId(),
                b.getDoctor() != null ? b.getDoctor().getId() : null,
                b.getDoctor() != null ? b.getDoctor().getUsuario().getNombre() : null,
                b.getFecha(),
                b.getHoraInicio(),
                b.getHoraFin(),
                b.getMotivo());
    }
}

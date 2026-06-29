package com.careone.api.core.cita;

import com.careone.api.util.enums.CanalConfirmacion;
import com.careone.api.util.enums.EstadoCita;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/** DTO de salida de una cita para el timeline / drawer. */
public record CitaRecord(
        Long id,
        Long pacienteId,
        String pacienteNombre,
        String pacienteAlergias,
        Long doctorId,
        String doctorNombre,
        Long tipoCitaId,
        String tipoCitaNombre,
        String tratamiento,
        String motivo,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        int duracionMin,
        EstadoCita estado,
        BigDecimal monto,
        CanalConfirmacion canalConfirmacion,
        boolean primeraVez,
        boolean recordatorioWhatsapp,
        String notas
) {
    public static CitaRecord from(Cita c) {
        var p = c.getPaciente();
        var tipo = c.getTipoCita();
        return new CitaRecord(
                c.getId(), p.getId(),
                (p.getNombre() + " " + (p.getApellidos() != null ? p.getApellidos() : "")).trim(),
                p.getAlergias(),
                c.getDoctor().getId(), c.getDoctor().getUsuario().getNombre(),
                tipo != null ? tipo.getId() : null,
                tipo != null ? tipo.getNombre() : null,
                c.getTratamiento(), c.getMotivo(),
                c.getFecha(), c.getHoraInicio(), c.getHoraFin(),
                c.getDuracionMin(), c.getEstado(), c.getMonto(),
                c.getCanalConfirmacion(),
                c.isPrimeraVez(), c.isRecordatorioWhatsapp(), c.getNotas());
    }
}

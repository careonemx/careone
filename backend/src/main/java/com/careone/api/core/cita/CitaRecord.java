package com.careone.api.core.cita;

import com.careone.api.core.historia.AlertaClinica;
import com.careone.api.core.historia.AlertaRecord;
import com.careone.api.core.historia.HistoriaClinica;
import com.careone.api.util.enums.CanalConfirmacion;
import com.careone.api.util.enums.EstadoCita;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** DTO de salida de una cita para el timeline / drawer. */
public record CitaRecord(
        Long id,
        Long pacienteId,
        String pacienteNombre,
        String pacienteAlergias,
        List<AlertaRecord> alertas,
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
    /** Sin historia clínica: sin alertas derivadas (p. ej. historial de paciente). */
    public static CitaRecord from(Cita c) {
        return from(c, null);
    }

    /** Con la historia clínica del paciente: las alertas nacen de ella. */
    public static CitaRecord from(Cita c, HistoriaClinica historia) {
        var p = c.getPaciente();
        var tipo = c.getTipoCita();
        return new CitaRecord(
                c.getId(), p.getId(),
                (p.getNombre() + " " + (p.getApellidos() != null ? p.getApellidos() : "")).trim(),
                p.getAlergias(),
                AlertaClinica.de(historia),
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

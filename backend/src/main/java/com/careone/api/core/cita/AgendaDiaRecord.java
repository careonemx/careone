package com.careone.api.core.cita;

import java.math.BigDecimal;
import java.util.List;

/**
 * Respuesta consolidada de la Agenda de un dia: citas + slots libres + panel de
 * pendientes + resumen numerico.
 */
public record AgendaDiaRecord(
        List<CitaRecord> citas,
        List<SlotLibreRecord> slotsLibres,
        List<PendienteRecord> cobrosPendientes,
        List<PendienteRecord> confirmacionesPendientes,
        List<PendienteRecord> reagendaciones,
        ResumenDia resumen
) {
    /** Item del panel de pendientes (cobro/confirmacion/reagendacion). */
    public record PendienteRecord(Long citaId, String pacienteNombre, String detalle) {}

    /** Resumen numerico del dia. */
    public record ResumenDia(int totalCitas, BigDecimal montoProgramado, BigDecimal montoCobrado) {}
}

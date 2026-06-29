package com.careone.api.core.inicio;

import com.careone.api.core.cita.CitaRecord;
import java.math.BigDecimal;
import java.util.List;

/**
 * Respuesta consolidada de la pantalla Inicio (spec CareOne v1.0).
 * KPIs del dia + tarjetas inteligentes ordenadas por prioridad + agenda del dia.
 */
public record InicioRecord(
        String saludo,
        Kpis kpis,
        List<TarjetaInteligente> tarjetas,
        List<CitaRecord> agenda
) {
    /** KPIs del dia. */
    public record Kpis(
            int citasHoy,
            int confirmadas,
            BigDecimal ingresoEsperado,
            BigDecimal cobradoHoy
    ) {}

    /**
     * Tarjeta de accion prioritaria. `clave` identifica el tipo
     * (CONFIRMACIONES, COBRANZA, INASISTENCIAS, TRATAMIENTOS, REVISIONES).
     * `prioridad` (menor = mas urgente) ordena la lista en el servidor.
     */
    public record TarjetaInteligente(
            String clave,
            String titulo,
            String descripcion,
            int cantidad,
            int prioridad,
            List<Item> items
    ) {
        /** Item dentro de una tarjeta (un paciente/cita afectado). */
        public record Item(Long citaId, Long pacienteId, String pacienteNombre, String detalle) {}
    }
}

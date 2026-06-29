package com.careone.api.util.enums;

/**
 * Ciclo de vida de una cita (spec CareOne v1.0).
 *
 * Plan Starter (visibles en UI):
 *   AGENDADA -> CONFIRMADA -> COMPLETADA ; CANCELADA / NO_ASISTIO desde Agendada o Confirmada.
 * Plan Pro (existen en BD, ocultos en UI por ahora):
 *   LLEGO, EN_CONSULTA.
 *
 * CANCELADA no se borra: desaparece del timeline pero queda en BD.
 */
public enum EstadoCita {
    AGENDADA,
    CONFIRMADA,
    COMPLETADA,
    CANCELADA,
    NO_ASISTIO,
    // ---- Plan Pro (no se renderizan en Starter) ----
    LLEGO,
    EN_CONSULTA
}

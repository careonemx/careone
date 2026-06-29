package com.careone.api.core.historia;

import java.util.List;

/**
 * Resumen clinico del paciente para el bloque de Resumen del expediente:
 * porcentaje de completitud + pendientes + alertas clinicas derivadas.
 */
public record ResumenClinicoRecord(
        int completitud,
        List<String> pendientes,
        List<String> alertas
) {
}

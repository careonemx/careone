package com.careone.api.core.historia;

/**
 * Alerta clínica para mostrar en la Agenda: etiqueta legible + nivel (ROJA/AMBAR).
 * Nace de la historia clínica del paciente (ver {@link AlertaClinica}).
 */
public record AlertaRecord(String etiqueta, String nivel) {
}

package com.careone.api.core.especialidad;

/** DTO de salida de especialidad. */
public record EspecialidadRecord(
        Long id,
        String codigo,
        String nombre,
        boolean activo
) {
    public static EspecialidadRecord from(Especialidad e) {
        return new EspecialidadRecord(e.getId(), e.getCodigo(), e.getNombre(), e.isActivo());
    }
}

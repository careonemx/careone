package com.careone.api.core.clinica;

import java.time.LocalTime;

/** DTO de salida de clinica (vista del SUPERADMIN). */
public record ClinicaRecord(
        Long id,
        String nombre,
        Long especialidadId,
        String especialidadNombre,
        String rfc,
        String telefono,
        String email,
        String direccion,
        LocalTime horaApertura,
        LocalTime horaCierre,
        boolean activo
) {
    public static ClinicaRecord from(Clinica c) {
        return new ClinicaRecord(
                c.getId(),
                c.getNombre(),
                c.getEspecialidad().getId(),
                c.getEspecialidad().getNombre(),
                c.getRfc(),
                c.getTelefono(),
                c.getEmail(),
                c.getDireccion(),
                c.getHoraApertura(),
                c.getHoraCierre(),
                c.isActivo());
    }
}

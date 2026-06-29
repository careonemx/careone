package com.careone.api.core.clinica;

import java.time.LocalTime;

/**
 * Configuracion visible/editable por el ADMIN_CLINICA de SU propia clinica.
 * No expone datos de control del Superadmin (activo, especialidad se cambia aparte).
 */
public record ConfiguracionClinicaRecord(
        Long id,
        String nombre,
        String especialidadNombre,
        String rfc,
        String telefono,
        String email,
        String direccion,
        LocalTime horaApertura,
        LocalTime horaCierre,
        String whatsappNumero,
        boolean whatsappActivo
) {
    public static ConfiguracionClinicaRecord from(Clinica c) {
        return new ConfiguracionClinicaRecord(
                c.getId(),
                c.getNombre(),
                c.getEspecialidad().getNombre(),
                c.getRfc(),
                c.getTelefono(),
                c.getEmail(),
                c.getDireccion(),
                c.getHoraApertura(),
                c.getHoraCierre(),
                c.getWhatsappNumero(),
                c.isWhatsappActivo());
    }
}

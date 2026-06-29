package com.careone.api.core.doctor;

/** DTO de salida de doctor (incluye datos del usuario asociado). */
public record DoctorRecord(
        Long id,
        Long usuarioId,
        String nombre,
        String apellidos,
        String email,
        String telefono,
        String cedula,
        Long especialidadId,
        String especialidadNombre,
        boolean activo
) {
    public static DoctorRecord from(Doctor d) {
        var u = d.getUsuario();
        return new DoctorRecord(
                d.getId(),
                u.getId(),
                u.getNombre(),
                u.getApellidos(),
                u.getEmail(),
                u.getTelefono(),
                d.getCedula(),
                d.getEspecialidad() != null ? d.getEspecialidad().getId() : null,
                d.getEspecialidad() != null ? d.getEspecialidad().getNombre() : null,
                d.isActivo());
    }
}

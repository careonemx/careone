package com.careone.api.core.ayudante;

/** DTO de salida de ayudante (siempre ligado a un doctor). */
public record AyudanteRecord(
        Long id,
        Long usuarioId,
        String nombre,
        String apellidos,
        String email,
        String telefono,
        Long doctorId,
        String doctorNombre,
        boolean activo
) {
    public static AyudanteRecord from(Ayudante a) {
        var u = a.getUsuario();
        var doc = a.getDoctor();
        return new AyudanteRecord(
                a.getId(),
                u.getId(),
                u.getNombre(),
                u.getApellidos(),
                u.getEmail(),
                u.getTelefono(),
                doc.getId(),
                doc.getUsuario().getNombre(),
                a.isActivo());
    }
}

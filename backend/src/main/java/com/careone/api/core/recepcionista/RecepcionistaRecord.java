package com.careone.api.core.recepcionista;

/** DTO de salida de recepcionista. doctorId/doctorNombre null = compartida. */
public record RecepcionistaRecord(
        Long id,
        Long usuarioId,
        String nombre,
        String apellidos,
        String email,
        String telefono,
        Long doctorId,
        String doctorNombre,
        boolean compartida,
        boolean activo
) {
    public static RecepcionistaRecord from(Recepcionista r) {
        var u = r.getUsuario();
        var doc = r.getDoctor();
        return new RecepcionistaRecord(
                r.getId(),
                u.getId(),
                u.getNombre(),
                u.getApellidos(),
                u.getEmail(),
                u.getTelefono(),
                doc != null ? doc.getId() : null,
                doc != null ? doc.getUsuario().getNombre() : null,
                doc == null,
                r.isActivo());
    }
}

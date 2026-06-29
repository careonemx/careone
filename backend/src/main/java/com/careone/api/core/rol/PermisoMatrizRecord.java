package com.careone.api.core.rol;

import java.util.List;

/**
 * Matriz efectiva de permisos por rol para una clinica (base + overrides).
 * Pensada para pintar la tabla "Quien puede hacer que" en el panel ADMIN_CLINICA.
 */
public record PermisoMatrizRecord(
        List<RolResumen> roles,
        List<PermisoResumen> permisos,
        List<Celda> celdas
) {
    public record RolResumen(Long id, String nombre) {}
    public record PermisoResumen(Long id, String codigo, String descripcion) {}
    /** Permiso efectivo (rol x permiso) y si proviene de un override de la clinica. */
    public record Celda(Long rolId, Long permisoId, boolean permitido, boolean esOverride) {}
}

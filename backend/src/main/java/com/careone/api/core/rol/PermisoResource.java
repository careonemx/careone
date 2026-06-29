package com.careone.api.core.rol;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Matriz de permisos configurable de la clinica (ADMIN_CLINICA).
 */
@RestController
@RequestMapping("/permisos")
@PreAuthorize("hasRole('ADMIN_CLINICA')")
public class PermisoResource {

    private final PermisoService service;

    public PermisoResource(PermisoService service) {
        this.service = service;
    }

    @GetMapping("/matriz")
    public ApiResponse<PermisoMatrizRecord> matriz() {
        return ApiResponse.ok(service.obtenerMatriz());
    }

    @PutMapping
    public ApiResponse<Void> cambiar(@Valid @RequestBody CambiarPermisoRequest req) {
        service.cambiarPermiso(req);
        return ApiResponse.message("Permiso actualizado.");
    }
}

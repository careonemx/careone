package com.careone.api.core.clinica;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Configuracion de la propia clinica (ADMIN_CLINICA). Distinto de /clinicas
 * (que es del SUPERADMIN y gestiona todas las clinicas).
 */
@RestController
@RequestMapping("/mi-clinica")
@PreAuthorize("hasRole('ADMIN_CLINICA')")
public class ConfiguracionClinicaResource {

    private final ConfiguracionClinicaService service;

    public ConfiguracionClinicaResource(ConfiguracionClinicaService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<ConfiguracionClinicaRecord> obtener() {
        return ApiResponse.ok(service.obtenerMiClinica());
    }

    @PutMapping
    public ApiResponse<ConfiguracionClinicaRecord> actualizar(
            @Valid @RequestBody ActualizarConfiguracionRequest req) {
        return ApiResponse.ok(service.actualizarMiClinica(req), "Configuracion actualizada.");
    }
}

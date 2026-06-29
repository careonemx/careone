package com.careone.api.core.especialidad;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Catalogo de especialidades. Lo administra el SUPERADMIN; las clinicas solo
 * leen las activas (para mostrar/elegir).
 */
@RestController
@RequestMapping("/especialidades")
public class EspecialidadResource {

    private final EspecialidadService service;

    public EspecialidadResource(EspecialidadService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ApiResponse<List<EspecialidadRecord>> listar() {
        return ApiResponse.ok(service.listarTodas());
    }

    @GetMapping("/activas")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<EspecialidadRecord>> listarActivas() {
        return ApiResponse.ok(service.listarActivas());
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ApiResponse<EspecialidadRecord> crear(@Valid @RequestBody GuardarEspecialidadRequest req) {
        return ApiResponse.ok(service.crear(req), "Especialidad creada.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ApiResponse<EspecialidadRecord> actualizar(@PathVariable Long id,
                                                      @Valid @RequestBody GuardarEspecialidadRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Especialidad actualizada.");
    }
}

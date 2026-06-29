package com.careone.api.core.clinica;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Gestion de clinicas (tenants). TODOS los endpoints exigen SUPERADMIN: es el
 * unico que da de alta / activa clinicas. NO accede a datos clinicos internos.
 */
@RestController
@RequestMapping("/clinicas")
@PreAuthorize("hasRole('SUPERADMIN')")
public class ClinicaResource {

    private final ClinicaService service;

    public ClinicaResource(ClinicaService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<Page<ClinicaRecord>> listar(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return ApiResponse.ok(service.listar(q, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ClinicaRecord> obtener(@PathVariable Long id) {
        return ApiResponse.ok(service.obtener(id));
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<ClinicaRecord> crear(@Valid @RequestBody CrearClinicaRequest req) {
        return ApiResponse.ok(service.crear(req), "Clinica creada.");
    }

    @PutMapping("/{id}")
    public ApiResponse<ClinicaRecord> actualizar(@PathVariable Long id,
                                                 @Valid @RequestBody CrearClinicaRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Clinica actualizada.");
    }

    @PatchMapping("/{id}/estado")
    public ApiResponse<ClinicaRecord> cambiarEstado(@PathVariable Long id,
                                                    @Valid @RequestBody EstadoClinicaRequest req) {
        return ApiResponse.ok(service.cambiarEstado(id, req.activo()),
                req.activo() ? "Clinica activada." : "Clinica desactivada.");
    }
}

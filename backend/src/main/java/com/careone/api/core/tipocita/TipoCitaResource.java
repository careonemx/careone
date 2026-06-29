package com.careone.api.core.tipocita;

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
 * Catalogo de tipos de cita de la clinica. El ADMIN_CLINICA los administra;
 * todo el personal puede leer los activos (para el selector de nueva cita).
 */
@RestController
@RequestMapping("/tipos-cita")
public class TipoCitaResource {

    private final TipoCitaService service;

    public TipoCitaResource(TipoCitaService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN_CLINICA')")
    public ApiResponse<List<TipoCitaRecord>> listar() {
        return ApiResponse.ok(service.listar());
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<List<TipoCitaRecord>> listarActivos() {
        return ApiResponse.ok(service.listarActivos());
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN_CLINICA')")
    public ApiResponse<TipoCitaRecord> crear(@Valid @RequestBody GuardarTipoCitaRequest req) {
        return ApiResponse.ok(service.crear(req), "Tipo de cita creado.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_CLINICA')")
    public ApiResponse<TipoCitaRecord> actualizar(@PathVariable Long id, @Valid @RequestBody GuardarTipoCitaRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Tipo de cita actualizado.");
    }
}

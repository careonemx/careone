package com.careone.api.core.ayudante;

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

@RestController
@RequestMapping("/ayudantes")
@PreAuthorize("hasRole('ADMIN_CLINICA')")
public class AyudanteResource {

    private final AyudanteService service;

    public AyudanteResource(AyudanteService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<AyudanteRecord>> listar() {
        return ApiResponse.ok(service.listar());
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<AyudanteRecord> crear(@Valid @RequestBody CrearAyudanteRequest req) {
        return ApiResponse.ok(service.crear(req), "Ayudante creado.");
    }

    @PutMapping("/{id}")
    public ApiResponse<AyudanteRecord> actualizar(@PathVariable Long id,
                                                  @Valid @RequestBody CrearAyudanteRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Ayudante actualizado.");
    }
}

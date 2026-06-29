package com.careone.api.core.recepcionista;

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
@RequestMapping("/recepcionistas")
@PreAuthorize("hasRole('ADMIN_CLINICA')")
public class RecepcionistaResource {

    private final RecepcionistaService service;

    public RecepcionistaResource(RecepcionistaService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<RecepcionistaRecord>> listar() {
        return ApiResponse.ok(service.listar());
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<RecepcionistaRecord> crear(@Valid @RequestBody CrearRecepcionistaRequest req) {
        return ApiResponse.ok(service.crear(req), "Recepcionista creada.");
    }

    @PutMapping("/{id}")
    public ApiResponse<RecepcionistaRecord> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody CrearRecepcionistaRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Recepcionista actualizada.");
    }
}

package com.careone.api.core.tratamiento;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tratamientos")
@PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
public class TratamientoResource {

    private final TratamientoService service;

    public TratamientoResource(TratamientoService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<TratamientoRecord>> porPaciente(@RequestParam Long pacienteId) {
        return ApiResponse.ok(service.listarPorPaciente(pacienteId));
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<TratamientoRecord> crear(@Valid @RequestBody GuardarTratamientoRequest req) {
        return ApiResponse.ok(service.crear(req), "Tratamiento creado.");
    }

    @PutMapping("/{id}")
    public ApiResponse<TratamientoRecord> actualizar(@PathVariable Long id, @Valid @RequestBody GuardarTratamientoRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Tratamiento actualizado.");
    }
}

package com.careone.api.core.doctor;

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
 * Gestion de doctores de la clinica. Solo el ADMIN_CLINICA administra el personal.
 * El aislamiento por tenant es automatico (filtro de Hibernate).
 */
@RestController
@RequestMapping("/doctores")
@PreAuthorize("hasRole('ADMIN_CLINICA')")
public class DoctorResource {

    private final DoctorService service;

    public DoctorResource(DoctorService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<DoctorRecord>> listar() {
        return ApiResponse.ok(service.listar());
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<DoctorRecord> crear(@Valid @RequestBody CrearDoctorRequest req) {
        return ApiResponse.ok(service.crear(req), "Doctor creado.");
    }

    @PutMapping("/{id}")
    public ApiResponse<DoctorRecord> actualizar(@PathVariable Long id,
                                                @Valid @RequestBody CrearDoctorRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Doctor actualizado.");
    }
}

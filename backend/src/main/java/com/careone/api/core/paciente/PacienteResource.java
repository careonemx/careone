package com.careone.api.core.paciente;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

/**
 * Pacientes de la clinica. Aislamiento por tenant automatico.
 * Roles que operan pacientes: ADMIN_CLINICA, DOCTOR, RECEPCIONISTA.
 */
@RestController
@RequestMapping("/pacientes")
public class PacienteResource {

    private final PacienteService service;

    public PacienteResource(PacienteService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<Page<PacienteRecord>> listar(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        return ApiResponse.ok(service.listar(q, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<PacienteRecord> obtener(@PathVariable Long id) {
        return ApiResponse.ok(service.obtener(id));
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<PacienteRecord> crear(@Valid @RequestBody GuardarPacienteRequest req) {
        return ApiResponse.ok(service.crear(req), "Paciente creado.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<PacienteRecord> actualizar(@PathVariable Long id,
                                                  @Valid @RequestBody GuardarPacienteRequest req) {
        return ApiResponse.ok(service.actualizar(id, req), "Paciente actualizado.");
    }
}

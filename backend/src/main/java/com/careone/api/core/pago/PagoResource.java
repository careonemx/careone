package com.careone.api.core.pago;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pagos")
@PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
public class PagoResource {

    private final PagoService service;

    public PagoResource(PagoService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<PagoRecord>> porPaciente(@RequestParam Long pacienteId) {
        return ApiResponse.ok(service.listarPorPaciente(pacienteId));
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<PagoRecord> registrar(@Valid @RequestBody RegistrarPagoRequest req) {
        return ApiResponse.ok(service.registrar(req), "Pago registrado.");
    }
}

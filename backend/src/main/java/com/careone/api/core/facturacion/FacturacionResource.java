package com.careone.api.core.facturacion;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Datos fiscales del paciente. SOLO captura (estructura CFDI). La emision de
 * facturas es fase futura (maqueta en frontend).
 */
@RestController
@RequestMapping("/pacientes/{pacienteId}/datos-fiscales")
@PreAuthorize("hasAnyRole('ADMIN_CLINICA','RECEPCIONISTA')")
public class FacturacionResource {

    private final FacturacionService service;

    public FacturacionResource(FacturacionService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<DatosFiscalesRecord> obtener(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.obtener(pacienteId));
    }

    @PutMapping
    public ApiResponse<DatosFiscalesRecord> guardar(@PathVariable Long pacienteId,
            @Valid @RequestBody GuardarDatosFiscalesRequest req) {
        return ApiResponse.ok(service.guardar(pacienteId, req), "Datos fiscales guardados.");
    }
}

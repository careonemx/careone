package com.careone.api.core.odontograma;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pacientes/{pacienteId}/odontograma")
@PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
public class OdontogramaResource {

    private final OdontogramaService service;

    public OdontogramaResource(OdontogramaService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<DienteRecord>> obtener(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.obtener(pacienteId));
    }

    @PutMapping("/diente")
    public ApiResponse<DienteRecord> guardar(@PathVariable Long pacienteId,
                                             @Valid @RequestBody GuardarDienteRequest req) {
        return ApiResponse.ok(service.guardar(pacienteId, req), "Diente actualizado.");
    }
}

package com.careone.api.core.historia;

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
 * Historia clinica, gineco-obstetricos, higiene bucal y resumen clinico
 * (completitud + alertas) de un paciente.
 */
@RestController
@RequestMapping("/pacientes/{pacienteId}")
public class HistoriaResource {

    private final HistoriaService service;

    public HistoriaResource(HistoriaService service) {
        this.service = service;
    }

    @GetMapping("/resumen-clinico")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<ResumenClinicoRecord> resumenClinico(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.resumenClinico(pacienteId));
    }

    @GetMapping("/historia")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
    public ApiResponse<HistoriaClinicaRecord> historia(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.obtenerHistoria(pacienteId));
    }

    @PutMapping("/historia")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
    public ApiResponse<HistoriaClinicaRecord> guardarHistoria(@PathVariable Long pacienteId,
            @Valid @RequestBody GuardarHistoriaRequest req) {
        return ApiResponse.ok(service.guardarHistoria(pacienteId, req), "Historia clinica guardada.");
    }

    @GetMapping("/gineco")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
    public ApiResponse<GinecoRecord> gineco(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.obtenerGineco(pacienteId));
    }

    @PutMapping("/gineco")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
    public ApiResponse<GinecoRecord> guardarGineco(@PathVariable Long pacienteId,
            @Valid @RequestBody GuardarGinecoRequest req) {
        return ApiResponse.ok(service.guardarGineco(pacienteId, req), "Antecedentes guardados.");
    }

    @GetMapping("/higiene")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
    public ApiResponse<HigieneRecord> higiene(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.obtenerHigiene(pacienteId));
    }

    @PutMapping("/higiene")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR')")
    public ApiResponse<HigieneRecord> guardarHigiene(@PathVariable Long pacienteId,
            @Valid @RequestBody GuardarHigieneRequest req) {
        return ApiResponse.ok(service.guardarHigiene(pacienteId, req), "Higiene bucal guardada.");
    }
}

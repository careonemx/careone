package com.careone.api.core.inicio;

import com.careone.api.exception.ApiResponse;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Pantalla Inicio (centro de operaciones de la clinica). Para todo el personal.
 */
@RestController
@RequestMapping("/inicio")
@PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
public class InicioResource {

    private final InicioService service;

    public InicioResource(InicioService service) {
        this.service = service;
    }

    @GetMapping("/resumen")
    public ApiResponse<InicioRecord> resumen(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ApiResponse.ok(service.resumen(fecha != null ? fecha : LocalDate.now()));
    }
}

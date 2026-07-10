package com.careone.api.core.bloqueo;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Bloqueos de horario de la agenda. */
@RestController
@RequestMapping("/bloqueos")
public class BloqueoHorarioResource {

    private final BloqueoHorarioService service;

    public BloqueoHorarioResource(BloqueoHorarioService service) {
        this.service = service;
    }

    @GetMapping("/rango")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<List<BloqueoHorarioRecord>> rango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ApiResponse.ok(service.enRango(desde, hasta));
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<BloqueoHorarioRecord> crear(@Valid @RequestBody CrearBloqueoRequest req) {
        return ApiResponse.ok(service.crear(req), "Horario bloqueado.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ApiResponse.message("Bloqueo eliminado.");
    }
}

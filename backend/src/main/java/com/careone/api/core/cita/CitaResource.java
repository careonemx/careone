package com.careone.api.core.cita;

import com.careone.api.exception.ApiResponse;
import com.careone.api.util.enums.EstadoCita;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/citas")
public class CitaResource {

    private final CitaService service;

    public CitaResource(CitaService service) {
        this.service = service;
    }

    @GetMapping("/agenda")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<AgendaDiaRecord> agenda(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ApiResponse.ok(service.agendaDelDia(fecha));
    }

    @GetMapping("/historial")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<java.util.List<CitaRecord>> historial(@RequestParam Long pacienteId) {
        return ApiResponse.ok(service.historialPaciente(pacienteId));
    }

    /** Citas en un rango de fechas (vistas semanal y mensual). */
    @GetMapping("/rango")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA','AYUDANTE')")
    public ApiResponse<java.util.List<CitaRecord>> rango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ApiResponse.ok(service.enRango(desde, hasta));
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<CitaRecord> crear(@Valid @RequestBody CrearCitaRequest req) {
        return ApiResponse.ok(service.crear(req), "Cita agendada.");
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<CitaRecord> cambiarEstado(@PathVariable Long id, @RequestParam EstadoCita estado) {
        return ApiResponse.ok(service.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/reagendar")
    @PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
    public ApiResponse<CitaRecord> reagendar(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaInicio,
            @RequestParam(required = false) Integer duracionMin) {
        return ApiResponse.ok(service.reagendar(id, fecha, horaInicio, duracionMin), "Cita reagendada.");
    }
}

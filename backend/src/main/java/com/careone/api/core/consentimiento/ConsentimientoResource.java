package com.careone.api.core.consentimiento;

import com.careone.api.exception.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.multipart.MultipartFile;

/**
 * Consentimientos de un paciente. Subir PDF (firma fisica) o marcar firma digital.
 */
@RestController
@RequestMapping("/pacientes/{pacienteId}/consentimientos")
@PreAuthorize("hasAnyRole('ADMIN_CLINICA','DOCTOR','RECEPCIONISTA')")
public class ConsentimientoResource {

    private final ConsentimientoService service;

    public ConsentimientoResource(ConsentimientoService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<ConsentimientoRecord>> listar(@PathVariable Long pacienteId) {
        return ApiResponse.ok(service.listar(pacienteId));
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping
    public ApiResponse<ConsentimientoRecord> crear(@PathVariable Long pacienteId,
            @Valid @RequestBody CrearConsentimientoRequest req) {
        return ApiResponse.ok(service.crear(pacienteId, req), "Consentimiento creado.");
    }

    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    @PostMapping("/{id}/archivo")
    public ApiResponse<ConsentimientoRecord> subir(@PathVariable Long pacienteId, @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        return ApiResponse.ok(service.subirArchivo(id, archivo), "Archivo subido.");
    }

    @PatchMapping("/{id}/firmar-digital")
    public ApiResponse<ConsentimientoRecord> firmarDigital(@PathVariable Long pacienteId, @PathVariable Long id) {
        return ApiResponse.ok(service.marcarFirmadoDigital(id), "Consentimiento firmado.");
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<ByteArrayResource> descargar(@PathVariable Long pacienteId, @PathVariable Long id) {
        ConsentimientoService.ArchivoDescarga a = service.descargar(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + a.nombre() + "\"")
                .body(new ByteArrayResource(a.datos()));
    }
}

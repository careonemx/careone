package com.careone.api.core.consentimiento;

import com.careone.api.exception.ConflictException;
import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import com.careone.api.util.enums.EstadoConsentimiento;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ConsentimientoService {

    private final ConsentimientoRepository repository;
    private final com.careone.api.core.paciente.PacienteRepository pacienteRepository;
    private final String storageDir;

    public ConsentimientoService(ConsentimientoRepository repository,
                                 com.careone.api.core.paciente.PacienteRepository pacienteRepository,
                                 @Value("${careone.storage.dir:/app/storage}") String storageDir) {
        this.repository = repository;
        this.pacienteRepository = pacienteRepository;
        this.storageDir = storageDir;
    }

    /** Anti-IDOR: el paciente debe existir en el tenant actual. */
    private void validarPaciente(Long pacienteId) {
        var p = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new com.careone.api.exception.NotFoundException("El paciente no existe."));
        if (!com.careone.api.security.SecurityUtil.perteneceAlTenant(p)) {
            throw new com.careone.api.exception.NotFoundException("El paciente no existe.");
        }
    }

    @Transactional(readOnly = true)
    public List<ConsentimientoRecord> listar(Long pacienteId) {
        validarPaciente(pacienteId);
        return repository.findByPacienteIdOrderByIdDesc(pacienteId).stream()
                .map(ConsentimientoRecord::from).toList();
    }

    @Transactional
    public ConsentimientoRecord crear(Long pacienteId, CrearConsentimientoRequest req) {
        validarPaciente(pacienteId);
        Consentimiento c = new Consentimiento();
        c.setPacienteId(pacienteId);
        c.setTipo(req.tipo());
        c.setEstado(EstadoConsentimiento.PENDIENTE);
        c.setNotas(req.notas());
        return ConsentimientoRecord.from(repository.save(c));
    }

    /** Subir PDF firmado fisico -> marca FIRMADO_FISICO. */
    @Transactional
    public ConsentimientoRecord subirArchivo(Long id, MultipartFile archivo) {
        Consentimiento c = buscar(id);
        if (archivo == null || archivo.isEmpty()) {
            throw new ConflictException("Debes adjuntar un archivo PDF.");
        }
        String ct = archivo.getContentType();
        if (ct == null || !ct.equalsIgnoreCase("application/pdf")) {
            throw new ConflictException("El archivo debe ser un PDF.");
        }
        if (archivo.getSize() > 10 * 1024 * 1024) {
            throw new ConflictException("El archivo no puede exceder 10 MB.");
        }
        try {
            Long tenantId = SecurityUtil.currentTenantId();
            Path dir = Paths.get(storageDir, "consentimientos", String.valueOf(tenantId));
            Files.createDirectories(dir);
            String nombreGuardado = UUID.randomUUID() + ".pdf";
            Path destino = dir.resolve(nombreGuardado);
            archivo.transferTo(destino);

            c.setArchivoNombre(sanitizar(archivo.getOriginalFilename()));
            c.setArchivoRuta(destino.toString());
            c.setEstado(EstadoConsentimiento.FIRMADO_FISICO);
            c.setFirmadoEn(Instant.now());
            return ConsentimientoRecord.from(repository.save(c));
        } catch (IOException e) {
            throw new ConflictException("No se pudo guardar el archivo.");
        }
    }

    /** Marcar como firmado digitalmente (la firma real en iPad es fase futura). */
    @Transactional
    public ConsentimientoRecord marcarFirmadoDigital(Long id) {
        Consentimiento c = buscar(id);
        c.setEstado(EstadoConsentimiento.FIRMADO_DIGITAL);
        c.setFirmadoEn(Instant.now());
        return ConsentimientoRecord.from(repository.save(c));
    }

    @Transactional(readOnly = true)
    public ArchivoDescarga descargar(Long id) {
        Consentimiento c = buscar(id);
        if (c.getArchivoRuta() == null) {
            throw new NotFoundException("Este consentimiento no tiene archivo.");
        }
        try {
            byte[] datos = Files.readAllBytes(Paths.get(c.getArchivoRuta()));
            return new ArchivoDescarga(datos, c.getArchivoNombre());
        } catch (IOException e) {
            throw new NotFoundException("No se pudo leer el archivo.");
        }
    }

    private Consentimiento buscar(Long id) {
        Consentimiento c = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        // Anti-IDOR: findById no pasa por el filtro de tenant.
        if (!SecurityUtil.perteneceAlTenant(c)) {
            throw new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO);
        }
        return c;
    }

    private String sanitizar(String nombre) {
        if (nombre == null) return "consentimiento.pdf";
        return nombre.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    /** Archivo para descarga (bytes + nombre original). */
    public record ArchivoDescarga(byte[] datos, String nombre) {}
}

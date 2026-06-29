package com.careone.api.core.especialidad;

import com.careone.api.exception.ConflictException;
import com.careone.api.exception.NotFoundException;
import com.careone.api.exception.MessageConstants;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EspecialidadService {

    private final EspecialidadRepository repository;

    public EspecialidadService(EspecialidadRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<EspecialidadRecord> listarTodas() {
        return repository.findAll().stream().map(EspecialidadRecord::from).toList();
    }

    @Transactional(readOnly = true)
    public List<EspecialidadRecord> listarActivas() {
        return repository.findAllByActivoTrueOrderByNombreAsc().stream()
                .map(EspecialidadRecord::from).toList();
    }

    @Transactional
    public EspecialidadRecord crear(GuardarEspecialidadRequest req) {
        if (repository.existsByCodigo(req.codigo())) {
            throw new ConflictException("Ya existe una especialidad con ese codigo.");
        }
        Especialidad e = new Especialidad();
        e.setCodigo(req.codigo());
        e.setNombre(req.nombre());
        e.setActivo(req.activo() == null || req.activo());
        return EspecialidadRecord.from(repository.save(e));
    }

    @Transactional
    public EspecialidadRecord actualizar(Long id, GuardarEspecialidadRequest req) {
        Especialidad e = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        if (!e.getCodigo().equals(req.codigo()) && repository.existsByCodigo(req.codigo())) {
            throw new ConflictException("Ya existe una especialidad con ese codigo.");
        }
        e.setCodigo(req.codigo());
        e.setNombre(req.nombre());
        if (req.activo() != null) {
            e.setActivo(req.activo());
        }
        return EspecialidadRecord.from(repository.save(e));
    }
}

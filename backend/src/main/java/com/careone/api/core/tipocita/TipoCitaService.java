package com.careone.api.core.tipocita;

import com.careone.api.exception.MessageConstants;
import com.careone.api.exception.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TipoCitaService {

    private final TipoCitaRepository repository;

    public TipoCitaService(TipoCitaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TipoCitaRecord> listar() {
        return repository.findAllByOrderByNombreAsc().stream().map(TipoCitaRecord::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoCitaRecord> listarActivos() {
        return repository.findAllByActivoTrueOrderByNombreAsc().stream().map(TipoCitaRecord::from).toList();
    }

    @Transactional
    public TipoCitaRecord crear(GuardarTipoCitaRequest req) {
        TipoCita t = new TipoCita();
        t.setNombre(req.nombre());
        t.setDuracionDefault(req.duracionDefault());
        t.setActivo(req.activo() == null || req.activo());
        return TipoCitaRecord.from(repository.save(t));
    }

    @Transactional
    public TipoCitaRecord actualizar(Long id, GuardarTipoCitaRequest req) {
        TipoCita t = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.RECURSO_NO_ENCONTRADO));
        t.setNombre(req.nombre());
        t.setDuracionDefault(req.duracionDefault());
        if (req.activo() != null) t.setActivo(req.activo());
        return TipoCitaRecord.from(repository.save(t));
    }
}

package com.careone.api.core.odontograma;

import com.careone.api.core.paciente.PacienteRepository;
import com.careone.api.exception.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OdontogramaService {

    private final OdontogramaRepository repository;
    private final PacienteRepository pacienteRepository;

    public OdontogramaService(OdontogramaRepository repository, PacienteRepository pacienteRepository) {
        this.repository = repository;
        this.pacienteRepository = pacienteRepository;
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
    public List<DienteRecord> obtener(Long pacienteId) {
        validarPaciente(pacienteId);
        return repository.findByPacienteIdOrderByFdiAsc(pacienteId).stream()
                .map(DienteRecord::from).toList();
    }

    /** Upsert del estado de un diente. */
    @Transactional
    public DienteRecord guardar(Long pacienteId, GuardarDienteRequest req) {
        validarPaciente(pacienteId);
        OdontogramaDiente d = repository.findByPacienteIdAndFdi(pacienteId, req.fdi())
                .orElseGet(() -> {
                    OdontogramaDiente nuevo = new OdontogramaDiente();
                    nuevo.setPacienteId(pacienteId);
                    nuevo.setFdi(req.fdi());
                    return nuevo;
                });
        d.setEstado(req.estado());
        if (req.brackets() != null) d.setBrackets(req.brackets());
        d.setNota(req.nota());
        return DienteRecord.from(repository.save(d));
    }
}

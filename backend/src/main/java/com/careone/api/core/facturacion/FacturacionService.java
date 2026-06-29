package com.careone.api.core.facturacion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Facturacion CFDI. SOLO captura de datos fiscales (estructura). El timbrado,
 * emision y cancelacion de facturas son fase futura (maqueta en el frontend).
 */
@Service
public class FacturacionService {

    private final DatosFiscalesRepository repository;
    private final com.careone.api.core.paciente.PacienteRepository pacienteRepository;

    public FacturacionService(DatosFiscalesRepository repository,
                              com.careone.api.core.paciente.PacienteRepository pacienteRepository) {
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
    public DatosFiscalesRecord obtener(Long pacienteId) {
        validarPaciente(pacienteId);
        return repository.findByPacienteId(pacienteId)
                .map(DatosFiscalesRecord::from).orElseGet(DatosFiscalesRecord::vacio);
    }

    @Transactional
    public DatosFiscalesRecord guardar(Long pacienteId, GuardarDatosFiscalesRequest req) {
        validarPaciente(pacienteId);
        DatosFiscales d = repository.findByPacienteId(pacienteId)
                .orElseGet(() -> { DatosFiscales n = new DatosFiscales(); n.setPacienteId(pacienteId); return n; });
        d.setRequiereFactura(Boolean.TRUE.equals(req.requiereFactura()));
        d.setRfc(req.rfc());
        d.setRazonSocial(req.razonSocial());
        d.setRegimenFiscal(req.regimenFiscal());
        d.setUsoCfdi(req.usoCfdi());
        d.setCpFiscal(req.cpFiscal());
        d.setEmailFactura(req.emailFactura());
        return DatosFiscalesRecord.from(repository.save(d));
    }
}

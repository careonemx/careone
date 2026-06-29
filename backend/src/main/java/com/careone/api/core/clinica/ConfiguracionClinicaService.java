package com.careone.api.core.clinica;

import com.careone.api.exception.ConflictException;
import com.careone.api.exception.NotFoundException;
import com.careone.api.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Configuracion de la propia clinica para el ADMIN_CLINICA. Siempre opera sobre
 * el tenant del usuario autenticado (no puede tocar otra clinica).
 */
@Service
public class ConfiguracionClinicaService {

    private final ClinicaRepository clinicaRepository;

    public ConfiguracionClinicaService(ClinicaRepository clinicaRepository) {
        this.clinicaRepository = clinicaRepository;
    }

    @Transactional(readOnly = true)
    public ConfiguracionClinicaRecord obtenerMiClinica() {
        return ConfiguracionClinicaRecord.from(miClinica());
    }

    @Transactional
    public ConfiguracionClinicaRecord actualizarMiClinica(ActualizarConfiguracionRequest req) {
        if (req.horaApertura().isAfter(req.horaCierre())) {
            throw new ConflictException("La hora de apertura no puede ser posterior a la de cierre.");
        }
        Clinica c = miClinica();
        c.setNombre(req.nombre());
        c.setRfc(req.rfc());
        c.setTelefono(req.telefono());
        c.setEmail(req.email());
        c.setDireccion(req.direccion());
        c.setHoraApertura(req.horaApertura());
        c.setHoraCierre(req.horaCierre());
        // WhatsApp: solo estructura, sin logica de envio (fase final).
        c.setWhatsappNumero(req.whatsappNumero());
        if (req.whatsappActivo() != null) {
            c.setWhatsappActivo(req.whatsappActivo());
        }
        return ConfiguracionClinicaRecord.from(clinicaRepository.save(c));
    }

    private Clinica miClinica() {
        Long tenantId = SecurityUtil.currentTenantId();
        if (tenantId == null) {
            throw new NotFoundException("No hay clinica en contexto.");
        }
        return clinicaRepository.findById(tenantId)
                .orElseThrow(() -> new NotFoundException("Clinica no encontrada."));
    }
}

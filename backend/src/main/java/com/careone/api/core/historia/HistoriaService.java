package com.careone.api.core.historia;

import com.careone.api.core.paciente.Paciente;
import com.careone.api.core.paciente.PacienteRepository;
import com.careone.api.exception.NotFoundException;
import com.careone.api.util.enums.Sexo;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HistoriaService {

    private final HistoriaClinicaRepository historiaRepository;
    private final GinecoObstetricoRepository ginecoRepository;
    private final HigieneBucalRepository higieneRepository;
    private final PacienteRepository pacienteRepository;
    private final com.careone.api.core.consentimiento.ConsentimientoRepository consentimientoRepository;

    public HistoriaService(HistoriaClinicaRepository historiaRepository,
                           GinecoObstetricoRepository ginecoRepository,
                           HigieneBucalRepository higieneRepository,
                           PacienteRepository pacienteRepository,
                           com.careone.api.core.consentimiento.ConsentimientoRepository consentimientoRepository) {
        this.historiaRepository = historiaRepository;
        this.ginecoRepository = ginecoRepository;
        this.higieneRepository = higieneRepository;
        this.pacienteRepository = pacienteRepository;
        this.consentimientoRepository = consentimientoRepository;
    }

    /**
     * Verifica que el paciente exista en el tenant actual (anti-IDOR). El filtro
     * de Hibernate hace que findById devuelva vacio si el paciente es de otra
     * clinica, evitando crear registros de expediente huerfanos.
     */
    private void validarPaciente(Long pacienteId) {
        Paciente p = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        // Anti-IDOR: findById/existsById NO pasan por el filtro de tenant.
        if (!com.careone.api.security.SecurityUtil.perteneceAlTenant(p)) {
            throw new NotFoundException("El paciente no existe.");
        }
    }

    // ---- Historia clinica ----

    @Transactional(readOnly = true)
    public HistoriaClinicaRecord obtenerHistoria(Long pacienteId) {
        validarPaciente(pacienteId);
        return historiaRepository.findByPacienteId(pacienteId)
                .map(HistoriaClinicaRecord::from).orElseGet(HistoriaClinicaRecord::vacia);
    }

    @Transactional
    public HistoriaClinicaRecord guardarHistoria(Long pacienteId, GuardarHistoriaRequest req) {
        validarPaciente(pacienteId);
        HistoriaClinica h = historiaRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> {
                    HistoriaClinica n = new HistoriaClinica();
                    n.setPacienteId(pacienteId);
                    return n;
                });
        aplicarCondiciones(h, req.condiciones());
        aplicarAntecedentes(h, req.antecedentes());
        h.setObservaciones(req.observaciones());
        h.setCompletada(true);
        return HistoriaClinicaRecord.from(historiaRepository.save(h));
    }

    // ---- Gineco ----

    @Transactional(readOnly = true)
    public GinecoRecord obtenerGineco(Long pacienteId) {
        validarPaciente(pacienteId);
        return ginecoRepository.findByPacienteId(pacienteId)
                .map(GinecoRecord::from).orElseGet(GinecoRecord::vacia);
    }

    @Transactional
    public GinecoRecord guardarGineco(Long pacienteId, GuardarGinecoRequest req) {
        validarPaciente(pacienteId);
        GinecoObstetrico g = ginecoRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> { GinecoObstetrico n = new GinecoObstetrico(); n.setPacienteId(pacienteId); return n; });
        g.setGestas(req.gestas() != null ? req.gestas() : 0);
        g.setPartos(req.partos() != null ? req.partos() : 0);
        g.setAbortos(req.abortos() != null ? req.abortos() : 0);
        g.setTiempoGestacion(req.tiempoGestacion());
        g.setMetodoPlanificacion(req.metodoPlanificacion());
        return GinecoRecord.from(ginecoRepository.save(g));
    }

    // ---- Higiene ----

    @Transactional(readOnly = true)
    public HigieneRecord obtenerHigiene(Long pacienteId) {
        validarPaciente(pacienteId);
        return higieneRepository.findByPacienteId(pacienteId)
                .map(HigieneRecord::from).orElseGet(HigieneRecord::vacia);
    }

    @Transactional
    public HigieneRecord guardarHigiene(Long pacienteId, GuardarHigieneRequest req) {
        validarPaciente(pacienteId);
        HigieneBucal h = higieneRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> { HigieneBucal n = new HigieneBucal(); n.setPacienteId(pacienteId); return n; });
        h.setCepilladosDia(req.cepilladosDia());
        h.setTipoCepillo(req.tipoCepillo());
        h.setUsaHilo(Boolean.TRUE.equals(req.usaHilo()));
        h.setUsaEnjuague(Boolean.TRUE.equals(req.usaEnjuague()));
        return HigieneRecord.from(higieneRepository.save(h));
    }

    // ---- Resumen clinico: completitud + alertas ----

    @Transactional(readOnly = true)
    public ResumenClinicoRecord resumenClinico(Long pacienteId) {
        Paciente p = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new NotFoundException("El paciente no existe."));
        HistoriaClinica h = historiaRepository.findByPacienteId(pacienteId).orElse(null);

        // ---- Completitud (4 bloques) ----
        List<String> pendientes = new ArrayList<>();
        int ok = 0, total = 4;
        boolean datosOk = p.getTelefono() != null && p.getFechaNacimiento() != null && p.getSexo() != null;
        if (datosOk) ok++; else pendientes.add("Datos personales");
        boolean emergenciaOk = p.getEmergenciaNombre() != null && p.getEmergenciaTelefono() != null;
        if (emergenciaOk) ok++; else pendientes.add("Contacto de emergencia");
        boolean historiaOk = h != null && h.isCompletada();
        if (historiaOk) ok++; else pendientes.add("Historia clinica");
        boolean alergiasOk = p.getAlergias() != null; // captura explicita (aunque sea "ninguna")
        if (alergiasOk) ok++; else pendientes.add("Alergias / alertas");
        int completitud = (int) Math.round(ok * 100.0 / total);

        // ---- Alertas clinicas (Regla 9: visibles en el Resumen) ----
        List<String> alertas = new ArrayList<>();
        if (p.getAlergias() != null && !p.getAlergias().isBlank()) {
            alertas.add("Alergia: " + p.getAlergias());
        }
        if (h != null) {
            if (h.isHipertension()) alertas.add("Hipertension arterial");
            if (h.isDiabetes()) alertas.add("Diabetes");
            if (h.isEmbarazo() && p.getSexo() == Sexo.FEMENINO) alertas.add("Embarazo");
            if (h.isProblemaCoagulacion()) alertas.add("Problemas de coagulacion / anticoagulantes");
            if (h.isProblemaAnestesia()) alertas.add("Problemas con anestesia local");
            if (h.isBajoCuidadoMedico()) alertas.add("Bajo cuidado medico");
            if (h.isAlergiaMedicamentos()) alertas.add("Alergia a medicamentos");
        }
        // Alerta administrativa: consentimientos pendientes (Regla de consentimientos).
        long pendientesConsent = consentimientoRepository.countByPacienteIdAndEstado(
                pacienteId, com.careone.api.util.enums.EstadoConsentimiento.PENDIENTE);
        if (pendientesConsent > 0) {
            alertas.add("Consentimiento pendiente de firma (" + pendientesConsent + ")");
        }
        return new ResumenClinicoRecord(completitud, pendientes, alertas);
    }

    // ---- mapeo de condiciones (clave -> setter) ----

    private void aplicarCondiciones(HistoriaClinica h, Map<String, Boolean> c) {
        if (c == null) return;
        Map<String, BiConsumer<HistoriaClinica, Boolean>> s = Map.ofEntries(
                Map.entry("trastornoCardiaco", HistoriaClinica::setTrastornoCardiaco),
                Map.entry("infarto", HistoriaClinica::setInfarto),
                Map.entry("soplos", HistoriaClinica::setSoplos),
                Map.entry("hipertension", HistoriaClinica::setHipertension),
                Map.entry("hipotension", HistoriaClinica::setHipotension),
                Map.entry("sinusitis", HistoriaClinica::setSinusitis),
                Map.entry("trastornosPsiq", HistoriaClinica::setTrastornosPsiq),
                Map.entry("depresion", HistoriaClinica::setDepresion),
                Map.entry("problemasHigado", HistoriaClinica::setProblemasHigado),
                Map.entry("asma", HistoriaClinica::setAsma),
                Map.entry("bradipnea", HistoriaClinica::setBradipnea),
                Map.entry("tuberculosis", HistoriaClinica::setTuberculosis),
                Map.entry("bronquitis", HistoriaClinica::setBronquitis),
                Map.entry("anemia", HistoriaClinica::setAnemia),
                Map.entry("leucemia", HistoriaClinica::setLeucemia),
                Map.entry("gastritis", HistoriaClinica::setGastritis),
                Map.entry("colitis", HistoriaClinica::setColitis),
                Map.entry("diabetes", HistoriaClinica::setDiabetes),
                Map.entry("artritis", HistoriaClinica::setArtritis),
                Map.entry("apoplejia", HistoriaClinica::setApoplejia),
                Map.entry("epilepsia", HistoriaClinica::setEpilepsia),
                Map.entry("convulsiones", HistoriaClinica::setConvulsiones),
                Map.entry("hipertiroidismo", HistoriaClinica::setHipertiroidismo),
                Map.entry("hipotiroidismo", HistoriaClinica::setHipotiroidismo),
                Map.entry("ets", HistoriaClinica::setEts),
                Map.entry("cancer", HistoriaClinica::setCancer),
                Map.entry("problemasRenales", HistoriaClinica::setProblemasRenales));
        c.forEach((k, v) -> { var fn = s.get(k); if (fn != null) fn.accept(h, Boolean.TRUE.equals(v)); });
    }

    private void aplicarAntecedentes(HistoriaClinica h, Map<String, Boolean> a) {
        if (a == null) return;
        Map<String, BiConsumer<HistoriaClinica, Boolean>> s = Map.ofEntries(
                Map.entry("hospitalizacion", HistoriaClinica::setHospitalizacion),
                Map.entry("atencionMedica6m", HistoriaClinica::setAtencionMedica6m),
                Map.entry("atencionOdon6m", HistoriaClinica::setAtencionOdon6m),
                Map.entry("problemaAnestesia", HistoriaClinica::setProblemaAnestesia),
                Map.entry("problemaCoagulacion", HistoriaClinica::setProblemaCoagulacion),
                Map.entry("habitosAdicciones", HistoriaClinica::setHabitosAdicciones),
                Map.entry("alergiaMedicamentos", HistoriaClinica::setAlergiaMedicamentos),
                Map.entry("tomaMedicamentos", HistoriaClinica::setTomaMedicamentos),
                Map.entry("bajoCuidadoMedico", HistoriaClinica::setBajoCuidadoMedico),
                Map.entry("embarazo", HistoriaClinica::setEmbarazo));
        a.forEach((k, v) -> { var fn = s.get(k); if (fn != null) fn.accept(h, Boolean.TRUE.equals(v)); });
    }
}

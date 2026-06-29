package com.careone.api.core.historia;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DTO de historia clinica. Las condiciones y antecedentes viajan como mapa
 * clave->boolean para que el frontend pinte los chips dinamicamente.
 */
public record HistoriaClinicaRecord(
        Map<String, Boolean> condiciones,
        Map<String, Boolean> antecedentes,
        String observaciones,
        boolean completada
) {
    public static HistoriaClinicaRecord from(HistoriaClinica h) {
        Map<String, Boolean> cond = new LinkedHashMap<>();
        cond.put("trastornoCardiaco", h.isTrastornoCardiaco());
        cond.put("infarto", h.isInfarto());
        cond.put("soplos", h.isSoplos());
        cond.put("hipertension", h.isHipertension());
        cond.put("hipotension", h.isHipotension());
        cond.put("sinusitis", h.isSinusitis());
        cond.put("trastornosPsiq", h.isTrastornosPsiq());
        cond.put("depresion", h.isDepresion());
        cond.put("problemasHigado", h.isProblemasHigado());
        cond.put("asma", h.isAsma());
        cond.put("bradipnea", h.isBradipnea());
        cond.put("tuberculosis", h.isTuberculosis());
        cond.put("bronquitis", h.isBronquitis());
        cond.put("anemia", h.isAnemia());
        cond.put("leucemia", h.isLeucemia());
        cond.put("gastritis", h.isGastritis());
        cond.put("colitis", h.isColitis());
        cond.put("diabetes", h.isDiabetes());
        cond.put("artritis", h.isArtritis());
        cond.put("apoplejia", h.isApoplejia());
        cond.put("epilepsia", h.isEpilepsia());
        cond.put("convulsiones", h.isConvulsiones());
        cond.put("hipertiroidismo", h.isHipertiroidismo());
        cond.put("hipotiroidismo", h.isHipotiroidismo());
        cond.put("ets", h.isEts());
        cond.put("cancer", h.isCancer());
        cond.put("problemasRenales", h.isProblemasRenales());

        Map<String, Boolean> ant = new LinkedHashMap<>();
        ant.put("hospitalizacion", h.isHospitalizacion());
        ant.put("atencionMedica6m", h.isAtencionMedica6m());
        ant.put("atencionOdon6m", h.isAtencionOdon6m());
        ant.put("problemaAnestesia", h.isProblemaAnestesia());
        ant.put("problemaCoagulacion", h.isProblemaCoagulacion());
        ant.put("habitosAdicciones", h.isHabitosAdicciones());
        ant.put("alergiaMedicamentos", h.isAlergiaMedicamentos());
        ant.put("tomaMedicamentos", h.isTomaMedicamentos());
        ant.put("bajoCuidadoMedico", h.isBajoCuidadoMedico());
        ant.put("embarazo", h.isEmbarazo());

        return new HistoriaClinicaRecord(cond, ant, h.getObservaciones(), h.isCompletada());
    }

    /** Historia vacia (paciente sin historia capturada todavia). */
    public static HistoriaClinicaRecord vacia() {
        return new HistoriaClinicaRecord(new LinkedHashMap<>(), new LinkedHashMap<>(), null, false);
    }
}

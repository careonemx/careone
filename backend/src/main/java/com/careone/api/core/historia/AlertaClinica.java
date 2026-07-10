package com.careone.api.core.historia;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

/**
 * Catálogo de alertas clínicas que se muestran en la Agenda (tarjeta de cita y
 * drawer). NACEN de la historia clínica del paciente (no de texto libre ni de un
 * catálogo aparte): cada condición marcada en la historia que sea relevante para
 * la seguridad de la atención genera una alerta.
 *
 * Nivel:
 *   ROJA  = riesgo inmediato en la atención (anestesia, sangrado, emergencia).
 *   AMBAR = condición a vigilar (no emergencia).
 *
 * Lista definida con el líder (jul 2026). Para agregar/quitar una alerta, se
 * edita SOLO este enum.
 */
public enum AlertaClinica {

    // ---- ROJAS (críticas) ----
    ALERGIA_MEDICAMENTOS(Nivel.ROJA, "Alergia a medicamentos", HistoriaClinica::isAlergiaMedicamentos),
    PROBLEMA_ANESTESIA(Nivel.ROJA, "Problema con anestesia", HistoriaClinica::isProblemaAnestesia),
    PROBLEMA_COAGULACION(Nivel.ROJA, "Problema de coagulación", HistoriaClinica::isProblemaCoagulacion),
    DIABETES(Nivel.ROJA, "Diabetes", HistoriaClinica::isDiabetes),
    TRASTORNO_CARDIACO(Nivel.ROJA, "Trastorno cardiaco", HistoriaClinica::isTrastornoCardiaco),
    INFARTO(Nivel.ROJA, "Antecedente de infarto", HistoriaClinica::isInfarto),
    EPILEPSIA(Nivel.ROJA, "Epilepsia", HistoriaClinica::isEpilepsia),
    CONVULSIONES(Nivel.ROJA, "Convulsiones", HistoriaClinica::isConvulsiones),
    EMBARAZO(Nivel.ROJA, "Embarazo", HistoriaClinica::isEmbarazo),

    // ---- ÁMBAR (a vigilar) ----
    HIPERTENSION(Nivel.AMBAR, "Hipertensión", HistoriaClinica::isHipertension),
    HIPOTENSION(Nivel.AMBAR, "Hipotensión", HistoriaClinica::isHipotension),
    HIPERTIROIDISMO(Nivel.AMBAR, "Hipertiroidismo", HistoriaClinica::isHipertiroidismo),
    HIPOTIROIDISMO(Nivel.AMBAR, "Hipotiroidismo", HistoriaClinica::isHipotiroidismo),
    ASMA(Nivel.AMBAR, "Asma", HistoriaClinica::isAsma);

    public enum Nivel { ROJA, AMBAR }

    private final Nivel nivel;
    private final String etiqueta;
    private final Predicate<HistoriaClinica> activa;

    AlertaClinica(Nivel nivel, String etiqueta, Predicate<HistoriaClinica> activa) {
        this.nivel = nivel;
        this.etiqueta = etiqueta;
        this.activa = activa;
    }

    public Nivel nivel() { return nivel; }
    public String etiqueta() { return etiqueta; }

    /**
     * Alertas activas de una historia clínica, ROJAS primero. Lista vacía si la
     * historia es null (paciente sin historia) o sin condiciones relevantes.
     */
    public static List<AlertaRecord> de(HistoriaClinica h) {
        if (h == null) return List.of();
        List<AlertaRecord> rojas = new ArrayList<>();
        List<AlertaRecord> ambar = new ArrayList<>();
        for (AlertaClinica a : values()) {
            if (a.activa.test(h)) {
                (a.nivel == Nivel.ROJA ? rojas : ambar).add(new AlertaRecord(a.etiqueta, a.nivel.name()));
            }
        }
        rojas.addAll(ambar); // rojas primero, luego ámbar
        return rojas;
    }
}

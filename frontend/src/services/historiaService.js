import api from './api';

/** Historia clinica, gineco, higiene y resumen clinico de un paciente. */
export const historiaService = {
  async resumenClinico(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/resumen-clinico`);
    return data.data;
  },
  async obtenerHistoria(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/historia`);
    return data.data;
  },
  async guardarHistoria(pacienteId, payload) {
    const { data } = await api.put(`/pacientes/${pacienteId}/historia`, payload);
    return data.data;
  },
  async obtenerGineco(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/gineco`);
    return data.data;
  },
  async guardarGineco(pacienteId, payload) {
    const { data } = await api.put(`/pacientes/${pacienteId}/gineco`, payload);
    return data.data;
  },
  async obtenerHigiene(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/higiene`);
    return data.data;
  },
  async guardarHigiene(pacienteId, payload) {
    const { data } = await api.put(`/pacientes/${pacienteId}/higiene`, payload);
    return data.data;
  },
};

// Etiquetas legibles de las 27 condiciones y antecedentes (clave -> texto).
export const LABELS_CONDICIONES = {
  trastornoCardiaco: 'Trastorno cardiaco', infarto: 'Infarto', soplos: 'Soplos cardiacos',
  hipertension: 'Hipertension', hipotension: 'Hipotension', sinusitis: 'Sinusitis',
  trastornosPsiq: 'Trastornos psiquiatricos', depresion: 'Depresion', problemasHigado: 'Problemas hepaticos',
  asma: 'Asma', bradipnea: 'Bradipnea', tuberculosis: 'Tuberculosis', bronquitis: 'Bronquitis',
  anemia: 'Anemia', leucemia: 'Leucemia', gastritis: 'Gastritis', colitis: 'Colitis',
  diabetes: 'Diabetes', artritis: 'Artritis', apoplejia: 'Apoplejia', epilepsia: 'Epilepsia',
  convulsiones: 'Convulsiones', hipertiroidismo: 'Hipertiroidismo', hipotiroidismo: 'Hipotiroidismo',
  ets: 'ETS', cancer: 'Cancer', problemasRenales: 'Problemas renales',
};

export const LABELS_ANTECEDENTES = {
  hospitalizacion: 'Hospitalizacion reciente',
  atencionMedica6m: 'Atencion medica ultimos 6 meses',
  atencionOdon6m: 'Atencion odontologica ultimos 6 meses',
  problemaAnestesia: 'Problemas con anestesia local',
  problemaCoagulacion: 'Problemas de coagulacion',
  habitosAdicciones: 'Habitos o adicciones',
  alergiaMedicamentos: 'Alergia a medicamentos',
  tomaMedicamentos: 'Toma medicamentos actualmente',
  bajoCuidadoMedico: 'Bajo cuidado medico',
  embarazo: 'Embarazo',
};

export default historiaService;

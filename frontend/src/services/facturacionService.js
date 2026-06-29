import api from './api';

/** Datos fiscales del paciente (CFDI). Solo captura; emision = fase futura. */
export const facturacionService = {
  async obtener(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/datos-fiscales`);
    return data.data;
  },
  async guardar(pacienteId, payload) {
    const { data } = await api.put(`/pacientes/${pacienteId}/datos-fiscales`, payload);
    return data.data;
  },
};

export default facturacionService;

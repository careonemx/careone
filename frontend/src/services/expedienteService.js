import api from './api';

/** Servicios del expediente: odontograma + historial de citas. */
export const odontogramaService = {
  async obtener(pacienteId) {
    const { data } = await api.get(`/pacientes/${pacienteId}/odontograma`);
    return data.data;
  },
  async guardarDiente(pacienteId, payload) {
    const { data } = await api.put(`/pacientes/${pacienteId}/odontograma/diente`, payload);
    return data.data;
  },
};

export const citasHistorialService = {
  async porPaciente(pacienteId) {
    const { data } = await api.get('/citas/historial', { params: { pacienteId } });
    return data.data;
  },
};

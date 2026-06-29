import api from './api';

/** Servicio de recepcionistas (panel ADMIN_CLINICA). */
export const recepcionistaService = {
  async listar() {
    const { data } = await api.get('/recepcionistas');
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/recepcionistas', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/recepcionistas/${id}`, payload);
    return data.data;
  },
};

export default recepcionistaService;

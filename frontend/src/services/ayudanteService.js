import api from './api';

/** Servicio de ayudantes (panel ADMIN_CLINICA). */
export const ayudanteService = {
  async listar() {
    const { data } = await api.get('/ayudantes');
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/ayudantes', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/ayudantes/${id}`, payload);
    return data.data;
  },
};

export default ayudanteService;

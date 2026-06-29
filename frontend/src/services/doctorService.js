import api from './api';

/** Servicio de doctores (panel ADMIN_CLINICA). Espeja core/doctor del backend. */
export const doctorService = {
  async listar() {
    const { data } = await api.get('/doctores');
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/doctores', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/doctores/${id}`, payload);
    return data.data;
  },
};

export default doctorService;

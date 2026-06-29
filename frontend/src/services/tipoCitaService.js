import api from './api';

/** Tipos de cita (catalogo configurable por clinica). Espeja core/tipocita. */
export const tipoCitaService = {
  async listar() {
    const { data } = await api.get('/tipos-cita');
    return data.data;
  },
  async listarActivos() {
    const { data } = await api.get('/tipos-cita/activos');
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/tipos-cita', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/tipos-cita/${id}`, payload);
    return data.data;
  },
};

export default tipoCitaService;

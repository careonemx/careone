import api from './api';

export const pagoService = {
  async porPaciente(pacienteId) {
    const { data } = await api.get('/pagos', { params: { pacienteId } });
    return data.data;
  },
  async registrar(payload) {
    const { data } = await api.post('/pagos', payload);
    return data.data;
  },
};

export const tratamientoService = {
  async porPaciente(pacienteId) {
    const { data } = await api.get('/tratamientos', { params: { pacienteId } });
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/tratamientos', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/tratamientos/${id}`, payload);
    return data.data;
  },
};

export default pagoService;

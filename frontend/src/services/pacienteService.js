import api from './api';

/** Servicio de pacientes. Espeja core/paciente del backend. */
export const pacienteService = {
  async listar({ q = '', page = 0, size = 20 } = {}) {
    const { data } = await api.get('/pacientes', { params: { q, page, size } });
    return data.data; // Page<PacienteRecord>
  },
  async obtener(id) {
    const { data } = await api.get(`/pacientes/${id}`);
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/pacientes', payload);
    return data.data;
  },
  /** Alta rapida: solo nombre + telefono (el resto del expediente se llena despues). */
  async altaRapida({ nombre, telefono }) {
    const { data } = await api.post('/pacientes', { nombre, telefono });
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/pacientes/${id}`, payload);
    return data.data;
  },
};

export default pacienteService;

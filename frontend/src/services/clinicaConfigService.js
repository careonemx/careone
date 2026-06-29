import api from './api';

/** Configuracion de la propia clinica (ADMIN_CLINICA). Espeja /mi-clinica. */
export const clinicaConfigService = {
  async obtener() {
    const { data } = await api.get('/mi-clinica');
    return data.data;
  },
  async actualizar(payload) {
    const { data } = await api.put('/mi-clinica', payload);
    return data.data;
  },
};

export default clinicaConfigService;

// Utilidades de validacion de formularios (cliente). Mensajes claros en espanol.
// Las reglas coinciden con las del backend (com.careone.api.util.Validaciones).

export const patrones = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^[+]?[0-9\s-]{7,20}$/,
  rfc: /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/,
  tipoSangre: /^(A|B|AB|O)[+-]$/,
};

export const mensajes = {
  requerido: 'Este campo es obligatorio.',
  email: 'El email no tiene un formato valido (ej. nombre@dominio.com).',
  telefono: 'El telefono solo puede contener numeros (7 a 15 digitos).',
  rfc: 'El RFC no tiene un formato valido (ej. XAXX010101000).',
  tipoSangre: 'El tipo de sangre debe ser A+, A-, B+, B-, AB+, AB-, O+ u O-.',
  max: (n) => `No puede exceder ${n} caracteres.`,
  min: (n) => `Debe tener al menos ${n} caracteres.`,
  positivo: 'Debe ser un numero mayor a cero.',
};

/**
 * Valida un objeto `valores` contra un esquema de reglas.
 * `reglas`: { campo: [fn(valor, valores) -> mensaje|null] }
 * Devuelve { campo: mensaje } solo con los campos que fallan.
 */
export function validar(valores, reglas) {
  const errores = {};
  for (const campo of Object.keys(reglas)) {
    for (const regla of reglas[campo]) {
      const msg = regla(valores[campo], valores);
      if (msg) { errores[campo] = msg; break; }
    }
  }
  return errores;
}

// ---- Reglas reutilizables ----
export const requerido = (v) => (v == null || String(v).trim() === '' ? mensajes.requerido : null);
export const esEmail = (v) => (!v ? null : patrones.email.test(v) ? null : mensajes.email);
export const esTelefono = (v) => (!v ? null : patrones.telefono.test(v) ? null : mensajes.telefono);
export const esRfc = (v) => (!v ? null : patrones.rfc.test(v.toUpperCase()) ? null : mensajes.rfc);
export const esTipoSangre = (v) => (!v ? null : patrones.tipoSangre.test(v.toUpperCase()) ? null : mensajes.tipoSangre);
export const maxLen = (n) => (v) => (v && String(v).length > n ? mensajes.max(n) : null);
export const minLen = (n) => (v) => (v && String(v).length < n ? mensajes.min(n) : null);
export const positivo = (v) => (v == null || v === '' ? null : Number(v) > 0 ? null : mensajes.positivo);

/** Para inputs de telefono: filtra todo lo que no sea digito, +, espacio o guion. */
export const soloTelefono = (v) => (v || '').replace(/[^0-9+\s-]/g, '');

/** Para inputs numericos puros (montos): solo digitos y punto decimal. */
export const soloNumero = (v) => (v || '').replace(/[^0-9.]/g, '');

/**
 * Extrae los errores por campo que devuelve el backend (ApiResponse.errors),
 * mapeando el nombre del campo del DTO al nombre del campo del formulario.
 * Devuelve { errores: {campo: msg}, mensaje: resumen }.
 */
export function erroresDelBackend(err, mapaCampos = {}) {
  const data = err?.response?.data;
  const errores = {};
  if (data?.errors) {
    for (const [campoDto, msg] of Object.entries(data.errors)) {
      const campoForm = mapaCampos[campoDto] || campoDto;
      errores[campoForm] = msg;
    }
  }
  return { errores, mensaje: data?.message || 'No se pudo guardar.' };
}

/**
 * Devuelve un mensaje de error claro para mostrar al usuario, a partir de
 * cualquier error de axios/red. Cubre: mensaje del backend, timeout, sin
 * conexion, y un fallback generico. Nunca devuelve "undefined".
 */
export function mensajeDeError(err) {
  // Mensaje claro que ya envia el backend (ApiResponse.message).
  const msg = err?.response?.data?.message;
  if (msg) return msg;

  const status = err?.response?.status;
  if (status === 401) return 'Tu sesion expiro. Inicia sesion de nuevo.';
  if (status === 403) return 'No tienes permiso para realizar esta accion.';
  if (status === 404) return 'El recurso solicitado no existe.';
  if (status === 413) return 'El archivo es demasiado grande.';
  if (status >= 500) return 'Ocurrio un error en el servidor. Intenta de nuevo.';

  if (err?.code === 'ECONNABORTED') return 'La operacion tardo demasiado. Revisa tu conexion.';
  if (err?.message === 'Network Error') return 'No hay conexion con el servidor.';

  return 'Ocurrio un error. Intenta de nuevo.';
}

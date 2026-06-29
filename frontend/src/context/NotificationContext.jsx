import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext(null);

/**
 * Singleton a nivel de modulo para que codigo NO-React (p. ej. los caches de
 * react-query) pueda disparar toasts. Lo registra el NotificationProvider.
 */
let notificadorGlobal = null;
export function notificarGlobal(msg, severity = 'success') {
  if (notificadorGlobal) notificadorGlobal(msg, severity);
}

/**
 * Toasts globales de confirmacion/error. Mensaje breve abajo al centro.
 * No cambia colores ni tipografia.
 */
export function NotificationProvider({ children }) {
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const notify = useCallback((msg, severity = 'success') => {
    setToast({ open: true, msg, severity });
  }, []);

  // Registrar el singleton para que los caches de react-query puedan notificar.
  useEffect(() => {
    notificadorGlobal = notify;
    return () => { notificadorGlobal = null; };
  }, [notify]);

  const success = useCallback((msg) => notify(msg, 'success'), [notify]);
  const error = useCallback((msg) => notify(msg, 'error'), [notify]);

  const close = (_, reason) => { if (reason !== 'clickaway') setToast((t) => ({ ...t, open: false })); };

  return (
    <NotificationContext.Provider value={{ notify, success, error }}>
      {children}
      <Snackbar open={toast.open} autoHideDuration={2800} onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={close} severity={toast.severity} variant="filled" sx={{ borderRadius: 2.5, fontWeight: 500 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify debe usarse dentro de <NotificationProvider>');
  return ctx;
}

export default NotificationContext;

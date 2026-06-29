import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './index.css';
import App from './App.jsx';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider, notificarGlobal } from './context/NotificationContext';
import { mensajeDeError } from './utils/validacion';

// ---- Manejo GLOBAL de errores ----
// Garantiza que NINGUNA falla quede silenciosa: si una mutacion o query falla
// sin su propio onError, se muestra un toast con el mensaje claro del backend.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      // Si la mutacion definio su propio onError, no duplicamos el toast.
      if (mutation.options.onError) return;
      notificarGlobal(mensajeDeError(error), 'error');
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Las queries muestran su error en pantalla (Alert); evitamos toast de 401
      // (esos los maneja el interceptor con refresh). Solo notificamos fallos reales.
      const status = error?.response?.status;
      if (status === 401) return;
      if (query.meta?.silencioso) return;
      notificarGlobal(mensajeDeError(error), 'error');
    },
  }),
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>
);

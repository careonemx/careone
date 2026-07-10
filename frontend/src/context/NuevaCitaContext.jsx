import { createContext, useContext, useState, useCallback } from 'react';
import { Fab } from '@mui/material';
import NuevaCitaDrawer from '../components/agenda/NuevaCitaDrawer';
import { Icon } from '../components/Icon';

// ============================================================================
// NuevaCitaContext — permite abrir el drawer de "Nueva cita" desde CUALQUIER
// módulo sin navegar a Agenda (tarea "Inicio/Agenda · Nueva Cita desde cualquier
// módulo"). El drawer se monta una sola vez en el layout de la clínica; las
// páginas solo llaman abrirNuevaCita().
//
// abrirNuevaCita({ paciente, fecha, hora }):
//   - paciente: si se abre desde la ficha de un paciente, queda preseleccionado.
//   - fecha/hora: opcionales (ej. desde un slot de la agenda).
// Al guardar, el usuario permanece en el módulo donde estaba (no se navega).
// ============================================================================

const NuevaCitaContext = createContext(null);

export function NuevaCitaProvider({ children }) {
  const [state, setState] = useState({ open: false, paciente: null, fecha: '', hora: '' });
  // nonce fuerza el remonte del drawer en cada apertura (reinicia su estado interno).
  const [nonce, setNonce] = useState(0);

  const abrirNuevaCita = useCallback((opts = {}) => {
    setNonce((n) => n + 1);
    setState({
      open: true,
      paciente: opts.paciente || null,
      fecha: opts.fecha || '',
      hora: opts.hora || '',
    });
  }, []);

  const cerrar = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <NuevaCitaContext.Provider value={{ abrirNuevaCita }}>
      {children}
      {/* Botón global: disponible en cualquier módulo sin navegar a Agenda. */}
      <Fab
        variant="extended" color="primary" aria-label="Nueva cita"
        onClick={() => abrirNuevaCita()}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, textTransform: 'none', fontWeight: 600, boxShadow: 3 }}
      >
        <Icon name="nuevo" size={18} style={{ marginRight: 8 }} />
        Nueva cita
      </Fab>
      <NuevaCitaDrawer
        key={nonce}
        open={state.open}
        onClose={cerrar}
        pacienteFijo={state.paciente}
        fecha={state.fecha}
        hora={state.hora}
        onSaved={cerrar}
      />
    </NuevaCitaContext.Provider>
  );
}

/** Hook para abrir el drawer de nueva cita desde cualquier página de la clínica. */
export function useNuevaCita() {
  const ctx = useContext(NuevaCitaContext);
  if (!ctx) throw new Error('useNuevaCita debe usarse dentro de <NuevaCitaProvider>');
  return ctx;
}

export default NuevaCitaContext;

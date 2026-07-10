import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert } from '@mui/material';
import { palette } from '../../theme';

// ============================================================================
// Diálogo de confirmación al reagendar por Drag & Drop (tarea "Reagendar cita").
// Al soltar la cita NO se guarda de inmediato: se pide confirmar el nuevo día/hora,
// y si hay conflicto con otra cita del mismo doctor, se advierte antes de permitir.
// ============================================================================

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
const fmtFecha = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) : '');

export default function ConfirmarReagendaDialog({ open, propuesta, hayConflicto, guardando, onConfirmar, onCancelar }) {
  if (!propuesta) return null;
  return (
    <Dialog open={open} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle>Reagendar cita</DialogTitle>
      <DialogContent>
        <Box sx={{ fontSize: 14, mb: 1.5 }}>
          Mover la cita de <b>{propuesta.pacienteNombre}</b> a:
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: palette.blueLight, border: `1px solid ${palette.blueMid}` }}>
          <Box sx={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', color: palette.blue }}>
            {fmtFecha(propuesta.fecha)}
          </Box>
          <Box sx={{ fontSize: 13, color: palette.text2 }}>{hhmm(propuesta.horaInicio)}</Box>
        </Box>
        {hayConflicto && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Ese horario se traslapa con otra cita del mismo doctor. Puedes continuar, pero revisa la agenda.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelar} disabled={guardando}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirmar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Confirmar cambio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

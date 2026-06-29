import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Chip, TextField, Grid, CircularProgress, Alert, Paper } from '@mui/material';
import historiaService, { LABELS_CONDICIONES, LABELS_ANTECEDENTES } from '../../services/historiaService';
import { palette } from '../../theme';

// Edad a partir de fecha de nacimiento ISO.
const edadDe = (fn) => { if (!fn) return null; return Math.floor((Date.now() - new Date(fn)) / 31557600000); };

// Chips Si/No de condiciones/antecedentes. Definido FUERA del componente para no
// recrearse en cada render (cumple react-hooks/static-components).
function Chips({ labels, obj, setter }) {
  const toggle = (k) => setter({ ...obj, [k]: !obj[k] });
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {labels.map((k) => (
        <Chip key={k} label={LABELS_CONDICIONES[k] || LABELS_ANTECEDENTES[k]} size="small"
          onClick={() => toggle(k)}
          sx={{
            cursor: 'pointer', fontWeight: obj[k] ? 600 : 400,
            bgcolor: obj[k] ? palette.redLight : '#FAFAFA',
            color: obj[k] ? palette.red : palette.text2,
            border: `1px solid ${obj[k] ? '#FCA5A5' : palette.border}`,
          }} />
      ))}
    </Box>
  );
}

export default function TabHistoria({ pacienteId, paciente }) {
  const qc = useQueryClient();
  const [edits, setEdits] = useState(null);
  const [msg, setMsg] = useState('');

  const esFemenino = paciente?.sexo === 'FEMENINO';
  const edad = edadDe(paciente?.fechaNacimiento);

  const histQuery = useQuery({ queryKey: ['historia', pacienteId], queryFn: () => historiaService.obtenerHistoria(pacienteId) });

  // Estado derivado (server + edits) -> sin useEffect/setState en effect.
  const base = histQuery.data || { condiciones: {}, antecedentes: {}, observaciones: '' };
  const datos = edits ?? { cond: base.condiciones || {}, ant: base.antecedentes || {}, obs: base.observaciones || '' };
  const cond = datos.cond, ant = datos.ant, obs = datos.obs;
  const setCond = (v) => setEdits({ ...datos, cond: typeof v === 'function' ? v(cond) : v });
  const setAnt = (v) => setEdits({ ...datos, ant: typeof v === 'function' ? v(ant) : v });
  const setObs = (v) => setEdits({ ...datos, obs: v });

  const saveMutation = useMutation({
    mutationFn: (payload) => historiaService.guardarHistoria(pacienteId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['historia', pacienteId] }); qc.invalidateQueries({ queryKey: ['resumen-clinico', pacienteId] }); setEdits(null); setMsg('Historia clinica guardada.'); },
    onError: () => setMsg('No se pudo guardar.'),
  });

  // Formulario inteligente: embarazo solo si femenino.
  const antVisibles = Object.keys(LABELS_ANTECEDENTES).filter((k) => k !== 'embarazo' || esFemenino);

  if (histQuery.isLoading) return <CircularProgress />;

  return (
    <>
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
        <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
          Padece o ha padecido de (clic para marcar)
        </Box>
        <Chips labels={Object.keys(LABELS_CONDICIONES)} obj={cond} setter={setCond} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
        <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
          Antecedentes personales
        </Box>
        <Chips labels={antVisibles} obj={ant} setter={setAnt} />
        <TextField label="Observaciones medicas" fullWidth multiline minRows={2} margin="dense" size="small" sx={{ mt: 2 }}
          value={obs} onChange={(e) => setObs(e.target.value)} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
          <Button variant="contained" onClick={() => saveMutation.mutate({ condiciones: cond, antecedentes: ant, observaciones: obs })}
            disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar historia'}
          </Button>
        </Box>
      </Paper>

      {/* Gineco-obstetricos: formulario inteligente (solo femenino) */}
      {esFemenino && <GinecoSection pacienteId={pacienteId} edad={edad} />}
    </>
  );
}

function GinecoSection({ pacienteId, edad }) {
  const qc = useQueryClient();
  const [edits, setEdits] = useState(null);
  const [msg, setMsg] = useState('');
  const query = useQuery({ queryKey: ['gineco', pacienteId], queryFn: () => historiaService.obtenerGineco(pacienteId) });

  // Form derivado (server + edits) -> sin useEffect/setState en effect.
  const form = edits ?? (query.data ? { ...query.data } : null);
  const setForm = setEdits;

  const save = useMutation({
    mutationFn: (p) => historiaService.guardarGineco(pacienteId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gineco', pacienteId] }); setEdits(null); setMsg('Antecedentes guardados.'); },
  });

  if (!form) return null;
  // Planificacion familiar solo si edad >= 15 (formulario inteligente).
  const mostrarPlanificacion = edad == null || edad >= 15;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
        Antecedentes gineco-obstetricos
      </Box>
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Grid container spacing={1}>
        <Grid item xs={4}><TextField label="Gestas" type="number" fullWidth size="small" margin="dense"
          value={form.gestas} onChange={(e) => setForm({ ...form, gestas: Number(e.target.value) })} /></Grid>
        <Grid item xs={4}><TextField label="Partos" type="number" fullWidth size="small" margin="dense"
          value={form.partos} onChange={(e) => setForm({ ...form, partos: Number(e.target.value) })} /></Grid>
        <Grid item xs={4}><TextField label="Abortos" type="number" fullWidth size="small" margin="dense"
          value={form.abortos} onChange={(e) => setForm({ ...form, abortos: Number(e.target.value) })} /></Grid>
        <Grid item xs={6}><TextField label="Tiempo de gestacion" fullWidth size="small" margin="dense"
          value={form.tiempoGestacion || ''} onChange={(e) => setForm({ ...form, tiempoGestacion: e.target.value })} /></Grid>
        {mostrarPlanificacion && (
          <Grid item xs={6}><TextField label="Metodo de planificacion" fullWidth size="small" margin="dense"
            value={form.metodoPlanificacion || ''} onChange={(e) => setForm({ ...form, metodoPlanificacion: e.target.value })} /></Grid>
        )}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
        <Button variant="contained" onClick={() => save.mutate(form)} disabled={save.isPending}>
          {save.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Paper>
  );
}

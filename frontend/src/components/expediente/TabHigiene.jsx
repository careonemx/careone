import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, Grid, CircularProgress, Alert, Paper, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import historiaService from '../../services/historiaService';
import { palette } from '../../theme';

export default function TabHigiene({ pacienteId }) {
  const qc = useQueryClient();
  const [edits, setEdits] = useState(null);
  const [msg, setMsg] = useState('');
  const query = useQuery({ queryKey: ['higiene', pacienteId], queryFn: () => historiaService.obtenerHigiene(pacienteId) });

  // Form derivado (server + edits del usuario) -> sin useEffect/setState en effect.
  const form = edits ?? (query.data ? { ...query.data } : null);
  const setForm = setEdits;

  const save = useMutation({
    mutationFn: (p) => historiaService.guardarHigiene(pacienteId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['higiene', pacienteId] }); setEdits(null); setMsg('Higiene bucal guardada.'); },
  });

  if (query.isLoading || !form) return <CircularProgress />;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, maxWidth: 560 }}>
      <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
        Higiene bucal
      </Box>
      {msg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      <Grid container spacing={1}>
        <Grid item xs={6}><TextField label="Cepillados por dia" type="number" fullWidth size="small" margin="dense"
          value={form.cepilladosDia ?? ''} onChange={(e) => setForm({ ...form, cepilladosDia: e.target.value ? Number(e.target.value) : null })} /></Grid>
        <Grid item xs={6}><TextField label="Tipo de cepillo" select fullWidth size="small" margin="dense"
          value={form.tipoCepillo || ''} onChange={(e) => setForm({ ...form, tipoCepillo: e.target.value })}>
          <MenuItem value="">—</MenuItem>
          <MenuItem value="Suave">Suave</MenuItem>
          <MenuItem value="Medio">Medio</MenuItem>
          <MenuItem value="Duro">Duro</MenuItem>
        </TextField></Grid>
        <Grid item xs={6}><FormControlLabel control={<Checkbox checked={form.usaHilo} onChange={(e) => setForm({ ...form, usaHilo: e.target.checked })} />} label="Usa hilo dental" /></Grid>
        <Grid item xs={6}><FormControlLabel control={<Checkbox checked={form.usaEnjuague} onChange={(e) => setForm({ ...form, usaEnjuague: e.target.checked })} />} label="Usa enjuague bucal" /></Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
        <Button variant="contained" onClick={() => save.mutate(form)} disabled={save.isPending}>
          {save.isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Paper>
  );
}

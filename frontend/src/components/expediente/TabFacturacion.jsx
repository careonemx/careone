import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, TextField, Grid, CircularProgress, Paper, MenuItem, FormControlLabel, Checkbox, Chip } from '@mui/material';
import facturacionService from '../../services/facturacionService';
import { useNotify } from '../../context/NotificationContext';
import { erroresDelBackend } from '../../utils/validacion';
import { palette } from '../../theme';

const USOS_CFDI = ['G01 - Adquisicion de mercancias', 'G03 - Gastos en general', 'D01 - Honorarios medicos', 'P01 - Por definir'];
const REGIMENES = ['605 - Sueldos y salarios', '612 - Personas fisicas con actividad empresarial', '601 - General de ley personas morales', '616 - Sin obligaciones fiscales'];

export default function TabFacturacion({ pacienteId }) {
  const qc = useQueryClient();
  const notify = useNotify();
  const [edits, setEdits] = useState(null);
  const [errs, setErrs] = useState({});

  const query = useQuery({ queryKey: ['datos-fiscales', pacienteId], queryFn: () => facturacionService.obtener(pacienteId) });

  // Form derivado (server + edits) -> sin useEffect/setState en effect.
  const form = edits ?? (query.data ? { ...query.data } : null);
  const setForm = setEdits;

  const save = useMutation({
    mutationFn: (p) => facturacionService.guardar(pacienteId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['datos-fiscales', pacienteId] }); setEdits(null); notify.success('Datos fiscales guardados.'); setErrs({}); },
    onError: (err) => { const { errores } = erroresDelBackend(err); setErrs(errores); },
  });

  const set = (k, v) => { setForm({ ...form, [k]: v }); if (errs[k]) setErrs((e) => ({ ...e, [k]: undefined })); };

  if (query.isLoading || !form) return <CircularProgress />;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2, maxWidth: 720 }}>
        <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
          Datos fiscales
        </Box>
        <FormControlLabel control={<Checkbox checked={form.requiereFactura} onChange={(e) => set('requiereFactura', e.target.checked)} />} label="Requiere factura" />
        <Grid container spacing={1}>
          <Grid item xs={6}><TextField label="RFC" fullWidth size="small" margin="dense" error={!!errs.rfc} helperText={errs.rfc || 'Ej. XAXX010101000'}
            value={form.rfc || ''} onChange={(e) => set('rfc', e.target.value.toUpperCase())} /></Grid>
          <Grid item xs={6}><TextField label="Razon social" fullWidth size="small" margin="dense"
            value={form.razonSocial || ''} onChange={(e) => set('razonSocial', e.target.value)} /></Grid>
          <Grid item xs={6}><TextField label="Regimen fiscal" select fullWidth size="small" margin="dense"
            value={form.regimenFiscal || ''} onChange={(e) => set('regimenFiscal', e.target.value)}>
            <MenuItem value="">—</MenuItem>
            {REGIMENES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={6}><TextField label="Uso de CFDI" select fullWidth size="small" margin="dense"
            value={form.usoCfdi || ''} onChange={(e) => set('usoCfdi', e.target.value)}>
            <MenuItem value="">—</MenuItem>
            {USOS_CFDI.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={4}><TextField label="CP fiscal" fullWidth size="small" margin="dense" error={!!errs.cpFiscal} helperText={errs.cpFiscal}
            value={form.cpFiscal || ''} onChange={(e) => set('cpFiscal', e.target.value.replace(/[^0-9]/g, ''))} /></Grid>
          <Grid item xs={8}><TextField label="Email para factura" type="email" fullWidth size="small" margin="dense" error={!!errs.emailFactura} helperText={errs.emailFactura}
            value={form.emailFactura || ''} onChange={(e) => set('emailFactura', e.target.value)} /></Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
          <Button variant="contained" onClick={() => save.mutate(form)} disabled={save.isPending}>
            {save.isPending ? 'Guardando...' : 'Guardar datos fiscales'}
          </Button>
        </Box>
      </Paper>

      {/* Historial de facturas — MAQUETA (sin logica de timbrado) */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, maxWidth: 720 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3 }}>Historial de facturas</Box>
          <Chip label="Proximamente" size="small" sx={{ ml: 1, bgcolor: palette.amberLight, color: '#92400E', fontWeight: 600 }} />
        </Box>
        <Box sx={{ textAlign: 'center', color: palette.text2, py: 3, fontSize: 13 }}>
          La emision de facturas (CFDI) se habilitara mas adelante.
        </Box>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" variant="outlined" disabled>Emitir factura</Button>
          <Button size="small" variant="outlined" disabled>Reenviar PDF/XML</Button>
        </Box>
      </Paper>
    </>
  );
}

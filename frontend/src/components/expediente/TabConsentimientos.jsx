import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip, CircularProgress, Alert, Paper, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import api from '../../services/api';
import consentimientoService, { TIPOS_CONSENTIMIENTO, ESTADO_LABEL } from '../../services/consentimientoService';
import { palette } from '../../theme';

const ESTADO_COLOR = {
  PENDIENTE: { bg: palette.amberLight, fg: '#92400E' },
  FIRMADO_DIGITAL: { bg: palette.greenLight, fg: '#15803D' },
  FIRMADO_FISICO: { bg: palette.greenLight, fg: '#15803D' },
};

export default function TabConsentimientos({ pacienteId }) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipo, setTipo] = useState('GENERAL');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(null);
  const fileRefs = useRef({});

  const query = useQuery({ queryKey: ['consentimientos', pacienteId], queryFn: () => consentimientoService.listar(pacienteId) });

  const crearMut = useMutation({
    mutationFn: (p) => consentimientoService.crear(pacienteId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consentimientos', pacienteId] }); qc.invalidateQueries({ queryKey: ['resumen-clinico', pacienteId] }); setDialogOpen(false); },
    onError: (err) => setError(err?.response?.data?.message || 'No se pudo crear.'),
  });

  const subirMut = useMutation({
    mutationFn: ({ id, file }) => consentimientoService.subirArchivo(pacienteId, id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consentimientos', pacienteId] }); qc.invalidateQueries({ queryKey: ['resumen-clinico', pacienteId] }); setSubiendo(null); },
    onError: () => setSubiendo(null),
  });

  const firmarMut = useMutation({
    mutationFn: (id) => consentimientoService.firmarDigital(pacienteId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consentimientos', pacienteId] }); qc.invalidateQueries({ queryKey: ['resumen-clinico', pacienteId] }); },
  });

  const verPdf = async (id) => {
    const resp = await api.get(`/pacientes/${pacienteId}/consentimientos/${id}/archivo`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(resp.data);
    window.open(url, '_blank');
  };

  const onPickFile = (id, e) => {
    const file = e.target.files?.[0];
    if (file) { setSubiendo(id); subirMut.mutate({ id, file }); }
  };

  const lista = query.data || [];

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3 }}>Consentimientos</Box>
        <Button size="small" variant="contained" sx={{ ml: 'auto' }} onClick={() => { setError(''); setDialogOpen(true); }}>+ Nuevo consentimiento</Button>
      </Box>

      {query.isLoading ? <CircularProgress /> : lista.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', color: palette.text2, borderRadius: 3 }}>No hay consentimientos registrados.</Paper>
      ) : lista.map((c) => {
        const col = ESTADO_COLOR[c.estado];
        const tipoLabel = TIPOS_CONSENTIMIENTO.find((t) => t.value === c.tipo)?.label || c.tipo;
        return (
          <Paper key={c.id} variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontSize: 14, fontWeight: 600 }}>{tipoLabel}</Box>
              <Box sx={{ fontSize: 12, color: palette.text3 }}>{c.notas || 'Sin notas'}{c.archivoNombre ? ` · ${c.archivoNombre}` : ''}</Box>
            </Box>
            <Chip label={ESTADO_LABEL[c.estado]} size="small" sx={{ bgcolor: col.bg, color: col.fg, fontWeight: 600 }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {c.tieneArchivo && <Button size="small" onClick={() => verPdf(c.id)}>Ver PDF</Button>}
              {c.estado === 'PENDIENTE' && (
                <>
                  <input type="file" accept="application/pdf" hidden ref={(el) => (fileRefs.current[c.id] = el)} onChange={(e) => onPickFile(c.id, e)} />
                  <Button size="small" variant="outlined" disabled={subiendo === c.id}
                    onClick={() => fileRefs.current[c.id]?.click()}>
                    {subiendo === c.id ? 'Subiendo...' : 'Subir PDF'}
                  </Button>
                  <Button size="small" onClick={() => firmarMut.mutate(c.id)}>Firmar (iPad)</Button>
                </>
              )}
            </Box>
          </Paper>
        );
      })}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nuevo consentimiento</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Tipo" select fullWidth margin="dense" size="small" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_CONSENTIMIENTO.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField label="Notas (opcional)" fullWidth margin="dense" size="small" value={notas} onChange={(e) => setNotas(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => crearMut.mutate({ tipo, notas })} disabled={crearMut.isPending}>
            {crearMut.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, TextField, CircularProgress, Alert, Paper, Grid, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import clinicaConfigService from '../services/clinicaConfigService';
import tipoCitaService from '../services/tipoCitaService';
import { palette } from '../theme';

// Convierte la respuesta del backend en el estado inicial del formulario.
const aFormulario = (c) => ({
  nombre: c.nombre || '', rfc: c.rfc || '', telefono: c.telefono || '',
  email: c.email || '', direccion: c.direccion || '',
  horaApertura: (c.horaApertura || '08:00:00').slice(0, 5),
  horaCierre: (c.horaCierre || '18:00:00').slice(0, 5),
  whatsappNumero: c.whatsappNumero || '', whatsappActivo: c.whatsappActivo || false,
});

export default function ClinicaConfiguracion() {
  const qc = useQueryClient();
  // edits: cambios del usuario; null = aun no ha editado (se muestra el dato del server).
  const [edits, setEdits] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const configQuery = useQuery({ queryKey: ['mi-clinica'], queryFn: () => clinicaConfigService.obtener() });

  // Form derivado: dato del server como base, sobreescrito por los edits del usuario.
  // Sin useEffect -> sin renders en cascada (cumple react-hooks/set-state-in-effect).
  const form = edits ?? (configQuery.data ? aFormulario(configQuery.data) : null);
  const setForm = setEdits;

  const saveMutation = useMutation({
    mutationFn: (payload) => clinicaConfigService.actualizar(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mi-clinica'] }); setEdits(null); setMsg('Configuracion guardada.'); setError(''); },
    onError: (err) => { setError(err?.response?.data?.message || 'No se pudo guardar.'); setMsg(''); },
  });

  const handleSave = () => {
    setMsg(''); setError('');
    saveMutation.mutate({
      ...form,
      horaApertura: form.horaApertura + ':00',
      horaCierre: form.horaCierre + ':00',
    });
  };

  return (
    <>
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Configuracion</Box>
      </Box>

      <Box sx={{ p: 3.5, maxWidth: 720 }}>
        {configQuery.isLoading || !form ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : configQuery.isError ? (
          <Alert severity="error">No se pudo cargar la configuracion.</Alert>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
              Datos de la clinica · {configQuery.data.especialidadNombre}
            </Box>
            <TextField label="Nombre" fullWidth required margin="dense" size="small"
              value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Grid container spacing={1}>
              <Grid item xs={6}><TextField label="RFC" fullWidth margin="dense" size="small"
                value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value })} /></Grid>
              <Grid item xs={6}><TextField label="Telefono" fullWidth margin="dense" size="small"
                value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Grid>
            </Grid>
            <TextField label="Email" type="email" fullWidth margin="dense" size="small"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Direccion" fullWidth margin="dense" size="small"
              value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />

            <Divider sx={{ my: 2 }} />
            <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>
              Horario de atencion (alimenta los espacios libres de la Agenda)
            </Box>
            <Grid container spacing={1}>
              <Grid item xs={6}><TextField label="Hora de apertura" type="time" fullWidth margin="dense" size="small"
                InputLabelProps={{ shrink: true }}
                value={form.horaApertura} onChange={(e) => setForm({ ...form, horaApertura: e.target.value })} /></Grid>
              <Grid item xs={6}><TextField label="Hora de cierre" type="time" fullWidth margin="dense" size="small"
                InputLabelProps={{ shrink: true }}
                value={form.horaCierre} onChange={(e) => setForm({ ...form, horaCierre: e.target.value })} /></Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending || !form.nombre}>
                {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          </Paper>
        )}

        <TiposCitaSection />
      </Box>
    </>
  );
}

function TiposCitaSection() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', duracionDefault: '', activo: true });
  const [error, setError] = useState('');

  const query = useQuery({ queryKey: ['tipos-cita'], queryFn: () => tipoCitaService.listar() });
  const saveMutation = useMutation({
    mutationFn: (payload) => (editing ? tipoCitaService.actualizar(editing.id, payload) : tipoCitaService.crear(payload)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tipos-cita'] }); setDialogOpen(false); },
    onError: (err) => setError(err?.response?.data?.message || 'No se pudo guardar.'),
  });

  const openCreate = () => { setEditing(null); setForm({ nombre: '', duracionDefault: '', activo: true }); setError(''); setDialogOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ nombre: t.nombre, duracionDefault: t.duracionDefault || '', activo: t.activo }); setError(''); setDialogOpen(true); };
  const handleSave = () => {
    setError('');
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    saveMutation.mutate({ ...form, duracionDefault: form.duracionDefault ? Number(form.duracionDefault) : null });
  };

  const tipos = query.data || [];

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3 }}>
          Tipos de cita
        </Box>
        <Button size="small" variant="contained" sx={{ ml: 'auto' }} onClick={openCreate}>+ Nuevo tipo</Button>
      </Box>
      {query.isLoading ? <CircularProgress size={22} /> : tipos.length === 0 ? (
        <Box sx={{ color: palette.text2, fontSize: 13 }}>No hay tipos de cita.</Box>
      ) : tipos.map((t) => (
        <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', py: 1, borderBottom: `1px solid ${palette.divider}` }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ fontSize: 13.5, fontWeight: 600, color: t.activo ? palette.text : palette.text3 }}>{t.nombre}</Box>
            <Box sx={{ fontSize: 11.5, color: palette.text3 }}>
              {t.duracionDefault ? `${t.duracionDefault} min sugeridos` : 'Sin duracion sugerida'}{!t.activo && ' · Inactivo'}
            </Box>
          </Box>
          <Button size="small" onClick={() => openEdit(t)}>Editar</Button>
        </Box>
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar tipo de cita' : 'Nuevo tipo de cita'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Nombre" fullWidth required margin="dense" size="small"
            value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <TextField label="Duracion sugerida (min, opcional)" type="number" fullWidth margin="dense" size="small"
            value={form.duracionDefault} onChange={(e) => setForm({ ...form, duracionDefault: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending || !form.nombre}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

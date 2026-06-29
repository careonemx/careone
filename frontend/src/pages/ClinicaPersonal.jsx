import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Alert, Paper,
} from '@mui/material';
import doctorService from '../services/doctorService';
import recepcionistaService from '../services/recepcionistaService';
import ayudanteService from '../services/ayudanteService';
import { useNotify } from '../context/NotificationContext';
import { palette } from '../theme';
import {
  validar, requerido, esEmail, esTelefono, maxLen, minLen,
  soloTelefono, erroresDelBackend,
} from '../utils/validacion';

const TABS = [
  { key: 'doctores', label: 'Doctores' },
  { key: 'recepcionistas', label: 'Recepcionistas' },
  { key: 'ayudantes', label: 'Ayudantes' },
];

const baseForm = { nombre: '', apellidos: '', email: '', telefono: '', password: '', activo: true };

export default function ClinicaPersonal() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('doctores');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(baseForm);
  const [formError, setFormError] = useState('');
  const [errs, setErrs] = useState({});

  const svc = { doctores: doctorService, recepcionistas: recepcionistaService, ayudantes: ayudanteService }[tab];

  const listQuery = useQuery({ queryKey: ['personal', tab], queryFn: () => svc.listar() });
  // doctores para los selects de recepcionista/ayudante
  const doctoresQuery = useQuery({ queryKey: ['personal', 'doctores'], queryFn: () => doctorService.listar() });

  const notify = useNotify();
  const saveMutation = useMutation({
    mutationFn: (payload) => (editing ? svc.actualizar(editing.id, payload) : svc.crear(payload)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['personal'] }); setDialogOpen(false); notify.success(editing ? 'Guardado.' : 'Creado correctamente.'); },
    onError: (err) => { const { errores, mensaje } = erroresDelBackend(err); setErrs(errores); setFormError(mensaje); },
  });

  const setCampo = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (errs[campo]) setErrs((e) => ({ ...e, [campo]: undefined }));
  };

  const openCreate = () => { setEditing(null); setForm({ ...baseForm, doctorId: '' }); setFormError(''); setErrs({}); setDialogOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      nombre: row.nombre, apellidos: row.apellidos || '', email: row.email, telefono: row.telefono || '',
      password: '', activo: row.activo, doctorId: row.doctorId ?? '',
    });
    setFormError(''); setErrs({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    setFormError('');
    const reglas = {
      nombre: [requerido, maxLen(120)],
      apellidos: [maxLen(120)],
      email: [requerido, esEmail, maxLen(160)],
      telefono: [esTelefono],
      // password obligatoria solo al crear; al editar es opcional
      password: editing ? [(v) => (v ? minLen(8)(v) : null)] : [requerido, minLen(8)],
    };
    if (tab === 'ayudantes') reglas.doctorId = [requerido];
    const errores = validar(form, reglas);
    if (Object.keys(errores).length > 0) {
      setErrs(errores);
      setFormError('Revisa los campos marcados en rojo.');
      return;
    }
    setErrs({});
    const payload = { ...form };
    if (tab === 'recepcionistas') payload.doctorId = form.doctorId === '' ? null : Number(form.doctorId);
    if (tab === 'ayudantes') payload.doctorId = form.doctorId === '' ? null : Number(form.doctorId);
    if (tab === 'doctores') delete payload.doctorId;
    saveMutation.mutate(payload);
  };

  const rows = listQuery.data || [];

  return (
    <>
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Personal</Box>
        <Button variant="contained" sx={{ ml: 'auto' }} onClick={openCreate}>+ Nuevo</Button>
      </Box>

      <Box sx={{ px: 3.5, borderBottom: `1px solid ${palette.border}`, bgcolor: palette.white }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {TABS.map((t) => <Tab key={t.key} value={t.key} label={t.label} />)}
        </Tabs>
      </Box>

      <Box sx={{ p: 3.5 }}>
        {listQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : listQuery.isError ? (
          <Alert severity="error">No se pudo cargar el personal.</Alert>
        ) : rows.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', color: palette.text2, borderRadius: 3 }}>
            No hay {TABS.find((t) => t.key === tab).label.toLowerCase()} todavia.
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefono</TableCell>
                  {tab === 'recepcionistas' && <TableCell>Asignacion</TableCell>}
                  {tab === 'ayudantes' && <TableCell>Doctor</TableCell>}
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.nombre} {row.apellidos}</TableCell>
                    <TableCell sx={{ color: palette.text2 }}>{row.email}</TableCell>
                    <TableCell sx={{ color: palette.text2 }}>{row.telefono || '—'}</TableCell>
                    {tab === 'recepcionistas' && (
                      <TableCell>{row.compartida
                        ? <Chip label="Compartida" size="small" sx={{ bgcolor: palette.blueLight, color: '#1D4ED8', fontWeight: 600 }} />
                        : <span>{row.doctorNombre}</span>}</TableCell>
                    )}
                    {tab === 'ayudantes' && <TableCell>{row.doctorNombre}</TableCell>}
                    <TableCell>
                      <Chip label={row.activo ? 'Activo' : 'Inactivo'} size="small"
                        sx={{ bgcolor: row.activo ? palette.greenLight : palette.divider, color: row.activo ? '#15803D' : palette.text3, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right"><Button size="small" onClick={() => openEdit(row)}>Editar</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar' : 'Nuevo'} {TABS.find((t) => t.key === tab).label.slice(0, -2).toLowerCase()}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField label="Nombre" fullWidth required margin="dense" size="small"
            error={!!errs.nombre} helperText={errs.nombre}
            value={form.nombre} onChange={(e) => setCampo('nombre', e.target.value)} />
          <TextField label="Apellidos" fullWidth margin="dense" size="small"
            error={!!errs.apellidos} helperText={errs.apellidos}
            value={form.apellidos} onChange={(e) => setCampo('apellidos', e.target.value)} />
          <TextField label="Email" type="email" fullWidth required margin="dense" size="small"
            error={!!errs.email} helperText={errs.email}
            value={form.email} onChange={(e) => setCampo('email', e.target.value)} disabled={!!editing} />
          <TextField label="Telefono" fullWidth margin="dense" size="small" inputMode="tel"
            error={!!errs.telefono} helperText={errs.telefono}
            value={form.telefono} onChange={(e) => setCampo('telefono', soloTelefono(e.target.value))} />
          <TextField label={editing ? 'Nueva contrasena (opcional)' : 'Contrasena'} type="password"
            fullWidth required={!editing} margin="dense" size="small"
            error={!!errs.password} helperText={errs.password || 'Minimo 8 caracteres'}
            value={form.password} onChange={(e) => setCampo('password', e.target.value)} />

          {tab === 'recepcionistas' && (
            <TextField label="Asignacion" select fullWidth margin="dense" size="small"
              value={form.doctorId} onChange={(e) => setCampo('doctorId', e.target.value)}
              helperText="Vacio = compartida por toda la clinica">
              <MenuItem value="">Compartida (toda la clinica)</MenuItem>
              {(doctoresQuery.data || []).map((d) => <MenuItem key={d.id} value={d.id}>{d.nombre} {d.apellidos}</MenuItem>)}
            </TextField>
          )}
          {tab === 'ayudantes' && (
            <TextField label="Doctor" select fullWidth required margin="dense" size="small"
              error={!!errs.doctorId} helperText={errs.doctorId}
              value={form.doctorId} onChange={(e) => setCampo('doctorId', e.target.value)}>
              {(doctoresQuery.data || []).map((d) => <MenuItem key={d.id} value={d.id}>{d.nombre} {d.apellidos}</MenuItem>)}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={saveMutation.isPending || !form.nombre || !form.email || (tab === 'ayudantes' && !form.doctorId)}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

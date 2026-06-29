import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import pacienteService from '../services/pacienteService';
import DataTable from '../components/DataTable';
import { useNotify } from '../context/NotificationContext';
import { palette } from '../theme';
import {
  validar, requerido, esEmail, esTelefono, esTipoSangre, maxLen,
  soloTelefono, erroresDelBackend,
} from '../utils/validacion';

const emptyForm = {
  nombre: '', apellidos: '', telefono: '', email: '', fechaNacimiento: '', sexo: '',
  ocupacion: '', tipoSangre: '', direccion: '', alergias: '', notas: '',
  emergenciaNombre: '', emergenciaParentesco: '', emergenciaTelefono: '',
};

const reglasPaciente = {
  nombre: [requerido, maxLen(120)],
  apellidos: [maxLen(120)],
  telefono: [esTelefono],
  email: [esEmail, maxLen(160)],
  ocupacion: [maxLen(120)],
  tipoSangre: [esTipoSangre],
  direccion: [maxLen(400)],
  alergias: [maxLen(600)],
  emergenciaTelefono: [esTelefono],
};

export default function ClinicaPacientes() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [errs, setErrs] = useState({});
  const notify = useNotify();

  const listQuery = useQuery({ queryKey: ['pacientes', q], queryFn: () => pacienteService.listar({ q }) });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editing ? pacienteService.actualizar(editing.id, payload) : pacienteService.crear(payload)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); setDialogOpen(false); notify.success(editing ? 'Paciente actualizado.' : 'Paciente creado.'); },
    onError: (err) => {
      const { errores, mensaje } = erroresDelBackend(err);
      setErrs(errores);
      setFormError(mensaje);
    },
  });

  const setCampo = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (errs[campo]) setErrs((e) => ({ ...e, [campo]: undefined }));
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(''); setErrs({}); setDialogOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nombre: p.nombre, apellidos: p.apellidos || '', telefono: p.telefono || '', email: p.email || '',
      fechaNacimiento: p.fechaNacimiento || '', sexo: p.sexo || '', ocupacion: p.ocupacion || '',
      tipoSangre: p.tipoSangre || '', direccion: p.direccion || '', alergias: p.alergias || '',
      notas: p.notas || '', emergenciaNombre: p.emergenciaNombre || '',
      emergenciaParentesco: p.emergenciaParentesco || '', emergenciaTelefono: p.emergenciaTelefono || '',
    });
    setFormError(''); setErrs({}); setDialogOpen(true);
  };

  const handleSave = () => {
    setFormError('');
    const errores = validar(form, reglasPaciente);
    if (Object.keys(errores).length > 0) {
      setErrs(errores);
      setFormError('Revisa los campos marcados en rojo.');
      return;
    }
    setErrs({});
    const payload = { ...form, sexo: form.sexo || null, fechaNacimiento: form.fechaNacimiento || null };
    saveMutation.mutate(payload);
  };

  const rows = listQuery.data?.content || [];

  // Columnas del DataGrid (orden/filtro automaticos por columna).
  const columnas = [
    {
      field: 'nombre', headerName: 'Nombre', flex: 1.4, minWidth: 180,
      valueGetter: (_v, row) => `${row.nombre} ${row.apellidos || ''}`.trim(),
      renderCell: (p) => <span style={{ fontWeight: 600 }}>{p.value}</span>,
    },
    { field: 'telefono', headerName: 'Telefono', flex: 1, minWidth: 130,
      valueGetter: (v) => v || '—' },
    { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 180,
      valueGetter: (v) => v || '—' },
    {
      field: 'alergias', headerName: 'Alertas', flex: 1, minWidth: 130, sortable: false,
      renderCell: (p) => p.value
        ? <Chip label="Alerta medica" size="small" sx={{ bgcolor: palette.redLight, color: palette.red, fontWeight: 600 }} />
        : <span style={{ color: palette.text3 }}>—</span>,
    },
    {
      field: 'acciones', headerName: 'Acciones', flex: 1, minWidth: 180,
      sortable: false, filterable: false, align: 'right', headerAlign: 'right',
      renderCell: (p) => (
        <Box onClick={(e) => e.stopPropagation()}>
          <Button size="small" onClick={() => openEdit(p.row)}>Editar</Button>
          <Button size="small" onClick={() => navigate(`/clinica/expediente/${p.row.id}`)}>Expediente</Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Pacientes</Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1.25 }}>
          <TextField size="small" placeholder="Buscar paciente..." value={q} onChange={(e) => setQ(e.target.value)} sx={{ width: 220 }} />
          <Button variant="contained" onClick={openCreate}>+ Nuevo paciente</Button>
        </Box>
      </Box>

      <Box sx={{ p: 3.5 }}>
        {listQuery.isError ? (
          <Alert severity="error">No se pudieron cargar los pacientes.</Alert>
        ) : (
          <DataTable
            loading={listQuery.isLoading}
            rows={rows}
            columns={columnas}
          />
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={1}>
            <Grid item xs={6}><TextField label="Nombre" fullWidth required margin="dense" size="small"
              error={!!errs.nombre} helperText={errs.nombre}
              value={form.nombre} onChange={(e) => setCampo('nombre', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="Apellidos" fullWidth margin="dense" size="small"
              error={!!errs.apellidos} helperText={errs.apellidos}
              value={form.apellidos} onChange={(e) => setCampo('apellidos', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="Telefono" fullWidth margin="dense" size="small"
              error={!!errs.telefono} helperText={errs.telefono} inputMode="tel"
              value={form.telefono} onChange={(e) => setCampo('telefono', soloTelefono(e.target.value))} /></Grid>
            <Grid item xs={6}><TextField label="Email" type="email" fullWidth margin="dense" size="small"
              error={!!errs.email} helperText={errs.email}
              value={form.email} onChange={(e) => setCampo('email', e.target.value)} /></Grid>
            <Grid item xs={4}><DatePicker label="Fecha de nacimiento"
              value={form.fechaNacimiento ? new Date(form.fechaNacimiento + 'T00:00:00') : null}
              onChange={(d) => setCampo('fechaNacimiento', d && !isNaN(d) ? d.toISOString().slice(0, 10) : '')}
              maxDate={new Date()}
              slotProps={{ textField: { fullWidth: true, margin: 'dense', size: 'small' }, field: { clearable: true } }} /></Grid>
            <Grid item xs={4}><TextField label="Sexo" select fullWidth margin="dense" size="small"
              value={form.sexo} onChange={(e) => setCampo('sexo', e.target.value)}>
              <MenuItem value="">—</MenuItem>
              <MenuItem value="MASCULINO">Masculino</MenuItem>
              <MenuItem value="FEMENINO">Femenino</MenuItem>
              <MenuItem value="OTRO">Otro</MenuItem>
            </TextField></Grid>
            <Grid item xs={4}><TextField label="Tipo de sangre" fullWidth margin="dense" size="small"
              error={!!errs.tipoSangre} helperText={errs.tipoSangre || 'Ej. O+, A-, AB+'}
              value={form.tipoSangre} onChange={(e) => setCampo('tipoSangre', e.target.value.toUpperCase())} /></Grid>
            <Grid item xs={6}><TextField label="Ocupacion" fullWidth margin="dense" size="small"
              error={!!errs.ocupacion} helperText={errs.ocupacion}
              value={form.ocupacion} onChange={(e) => setCampo('ocupacion', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="Direccion" fullWidth margin="dense" size="small"
              error={!!errs.direccion} helperText={errs.direccion}
              value={form.direccion} onChange={(e) => setCampo('direccion', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField label="Alergias / Alertas medicas" fullWidth margin="dense" size="small"
              multiline minRows={2} error={!!errs.alergias} helperText={errs.alergias}
              value={form.alergias} onChange={(e) => setCampo('alergias', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField label="Notas" fullWidth margin="dense" size="small" multiline minRows={2}
              value={form.notas} onChange={(e) => setCampo('notas', e.target.value)} /></Grid>
            <Grid item xs={4}><TextField label="Contacto emergencia" fullWidth margin="dense" size="small"
              value={form.emergenciaNombre} onChange={(e) => setCampo('emergenciaNombre', e.target.value)} /></Grid>
            <Grid item xs={4}><TextField label="Parentesco" fullWidth margin="dense" size="small"
              value={form.emergenciaParentesco} onChange={(e) => setCampo('emergenciaParentesco', e.target.value)} /></Grid>
            <Grid item xs={4}><TextField label="Telefono emergencia" fullWidth margin="dense" size="small"
              error={!!errs.emergenciaTelefono} helperText={errs.emergenciaTelefono} inputMode="tel"
              value={form.emergenciaTelefono} onChange={(e) => setCampo('emergenciaTelefono', soloTelefono(e.target.value))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending || !form.nombre}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Switch, Alert,
} from '@mui/material';
import clinicaService from '../services/clinicaService';
import especialidadService from '../services/especialidadService';
import DataTable from '../components/DataTable';
import { palette } from '../theme';
import {
  validar, requerido, esEmail, esTelefono, esRfc, maxLen, minLen,
  soloTelefono, erroresDelBackend,
} from '../utils/validacion';

const emptyForm = {
  nombre: '', especialidadId: '', telefono: '', email: '', direccion: '', rfc: '',
  adminNombre: '', adminEmail: '', adminPassword: '',
};

export default function SuperadminClinicas() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [errs, setErrs] = useState({});

  const clinicasQuery = useQuery({
    queryKey: ['clinicas', q],
    queryFn: () => clinicaService.listar({ q }),
  });

  const especialidadesQuery = useQuery({
    queryKey: ['especialidades', 'activas'],
    queryFn: () => especialidadService.listarActivas(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? clinicaService.actualizar(editing.id, payload) : clinicaService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clinicas'] });
      closeDialog();
    },
    onError: (err) => { const { errores, mensaje } = erroresDelBackend(err); setErrs(errores); setFormError(mensaje); },
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, activo }) => clinicaService.cambiarEstado(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinicas'] }),
  });

  const setCampo = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (errs[campo]) setErrs((e) => ({ ...e, [campo]: undefined }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(''); setErrs({});
    setDialogOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      nombre: c.nombre, especialidadId: c.especialidadId, telefono: c.telefono || '',
      email: c.email || '', direccion: c.direccion || '', rfc: c.rfc || '',
      adminNombre: '', adminEmail: '', adminPassword: '',
    });
    setFormError(''); setErrs({});
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = () => {
    setFormError('');
    const reglas = {
      nombre: [requerido, maxLen(160)],
      especialidadId: [requerido],
      rfc: [esRfc],
      telefono: [esTelefono],
      email: [esEmail, maxLen(160)],
    };
    if (!editing) {
      // El admin es opcional, pero si pones email debes poner password valida.
      if (form.adminEmail) {
        reglas.adminEmail = [esEmail];
        reglas.adminPassword = [requerido, minLen(8)];
      }
    }
    const errores = validar(form, reglas);
    if (Object.keys(errores).length > 0) {
      setErrs(errores);
      setFormError('Revisa los campos marcados en rojo.');
      return;
    }
    setErrs({});
    saveMutation.mutate({ ...form, especialidadId: Number(form.especialidadId) });
  };

  const page = clinicasQuery.data;
  const rows = page?.content || [];

  return (
    <>
      {/* Topbar */}
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Clinicas</Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1.25 }}>
          <TextField
            size="small" placeholder="Buscar clinica..."
            value={q} onChange={(e) => setQ(e.target.value)}
            sx={{ width: 220 }}
          />
          <Button variant="contained" onClick={openCreate}>+ Nueva clinica</Button>
        </Box>
      </Box>

      <Box sx={{ p: 3.5 }}>
        {clinicasQuery.isError ? (
          <Alert severity="error">No se pudieron cargar las clinicas.</Alert>
        ) : (
          <DataTable loading={clinicasQuery.isLoading} rows={rows} columns={[
            { field: 'nombre', headerName: 'Nombre', flex: 1.3, minWidth: 160,
              renderCell: (p) => <span style={{ fontWeight: 600 }}>{p.value}</span> },
            { field: 'especialidadNombre', headerName: 'Especialidad', flex: 1, minWidth: 130 },
            { field: 'telefono', headerName: 'Telefono', flex: 1, minWidth: 120, valueGetter: (v) => v || '—' },
            { field: 'horario', headerName: 'Horario', flex: 1, minWidth: 120, sortable: false,
              valueGetter: (_v, row) => `${row.horaApertura?.slice(0, 5)}–${row.horaCierre?.slice(0, 5)}` },
            { field: 'activo', headerName: 'Estado', flex: 0.8, minWidth: 110,
              renderCell: (p) => <Chip label={p.value ? 'Activa' : 'Inactiva'} size="small"
                sx={{ bgcolor: p.value ? palette.greenLight : palette.divider, color: p.value ? '#15803D' : palette.text3, fontWeight: 600 }} /> },
            { field: 'acciones', headerName: 'Acciones', flex: 1, minWidth: 150, sortable: false, filterable: false, align: 'right', headerAlign: 'right',
              renderCell: (p) => (
                <Box onClick={(e) => e.stopPropagation()}>
                  <Button size="small" onClick={() => openEdit(p.row)}>Editar</Button>
                  <Switch checked={p.row.activo} size="small"
                    onChange={(e) => estadoMutation.mutate({ id: p.row.id, activo: e.target.checked })} />
                </Box>
              ) },
          ]} />
        )}
      </Box>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar clinica' : 'Nueva clinica'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField label="Nombre" fullWidth required margin="dense" size="small"
            error={!!errs.nombre} helperText={errs.nombre}
            value={form.nombre} onChange={(e) => setCampo('nombre', e.target.value)} />
          <TextField label="Especialidad" select fullWidth required margin="dense" size="small"
            error={!!errs.especialidadId} helperText={errs.especialidadId}
            value={form.especialidadId} onChange={(e) => setCampo('especialidadId', e.target.value)}>
            {(especialidadesQuery.data || []).map((e) => (
              <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
            ))}
          </TextField>
          <TextField label="Telefono" fullWidth margin="dense" size="small" inputMode="tel"
            error={!!errs.telefono} helperText={errs.telefono}
            value={form.telefono} onChange={(e) => setCampo('telefono', soloTelefono(e.target.value))} />
          <TextField label="Email" type="email" fullWidth margin="dense" size="small"
            error={!!errs.email} helperText={errs.email}
            value={form.email} onChange={(e) => setCampo('email', e.target.value)} />
          <TextField label="Direccion" fullWidth margin="dense" size="small"
            value={form.direccion} onChange={(e) => setCampo('direccion', e.target.value)} />
          <TextField label="RFC" fullWidth margin="dense" size="small"
            error={!!errs.rfc} helperText={errs.rfc || 'Ej. XAXX010101000'}
            value={form.rfc} onChange={(e) => setCampo('rfc', e.target.value.toUpperCase())} />

          {!editing && (
            <>
              <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#9CA3AF', mt: 2, mb: 0.5 }}>
                Administrador de la clinica
              </Box>
              <TextField label="Nombre del administrador" fullWidth margin="dense" size="small"
                value={form.adminNombre} onChange={(e) => setCampo('adminNombre', e.target.value)} />
              <TextField label="Email del administrador" type="email" fullWidth margin="dense" size="small"
                error={!!errs.adminEmail} helperText={errs.adminEmail}
                value={form.adminEmail} onChange={(e) => setCampo('adminEmail', e.target.value)} />
              <TextField label="Contrasena del administrador" type="password" fullWidth margin="dense" size="small"
                error={!!errs.adminPassword}
                helperText={errs.adminPassword || 'Minimo 8 caracteres. Con estas credenciales el administrador entrara a su clinica.'}
                value={form.adminPassword} onChange={(e) => setCampo('adminPassword', e.target.value)} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={saveMutation.isPending || !form.nombre || !form.especialidadId}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

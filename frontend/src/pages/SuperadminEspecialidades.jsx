import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
} from '@mui/material';
import especialidadService from '../services/especialidadService';
import DataTable from '../components/DataTable';
import { palette } from '../theme';

const emptyForm = { codigo: '', nombre: '', activo: true };

export default function SuperadminEspecialidades() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const query = useQuery({
    queryKey: ['especialidades', 'todas'],
    queryFn: () => especialidadService.listarTodas(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? especialidadService.actualizar(editing.id, payload) : especialidadService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['especialidades'] });
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err?.response?.data?.message || 'No se pudo guardar.'),
  });
  // (codigo y nombre obligatorios; el boton Guardar ya los exige y el backend
  //  devuelve mensajes claros por campo si algo falla.)

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(''); setDialogOpen(true); };
  const openEdit = (e) => { setEditing(e); setForm({ codigo: e.codigo, nombre: e.nombre, activo: e.activo }); setFormError(''); setDialogOpen(true); };

  const rows = query.data || [];

  return (
    <>
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Especialidades</Box>
        <Button variant="contained" sx={{ ml: 'auto' }} onClick={openCreate}>+ Nueva especialidad</Button>
      </Box>

      <Box sx={{ p: 3.5 }}>
        {query.isError ? (
          <Alert severity="error">No se pudieron cargar las especialidades.</Alert>
        ) : (
          <DataTable loading={query.isLoading} rows={rows} columns={[
            { field: 'codigo', headerName: 'Codigo', flex: 1, minWidth: 140,
              renderCell: (p) => <span style={{ fontFamily: 'monospace', color: palette.text2 }}>{p.value}</span> },
            { field: 'nombre', headerName: 'Nombre', flex: 1.5, minWidth: 180,
              renderCell: (p) => <span style={{ fontWeight: 600 }}>{p.value}</span> },
            { field: 'activo', headerName: 'Estado', flex: 0.8, minWidth: 110,
              renderCell: (p) => <Chip label={p.value ? 'Activa' : 'Inactiva'} size="small"
                sx={{ bgcolor: p.value ? palette.greenLight : palette.divider, color: p.value ? '#15803D' : palette.text3, fontWeight: 600 }} /> },
            { field: 'acciones', headerName: 'Acciones', flex: 0.6, minWidth: 100, sortable: false, filterable: false, align: 'right', headerAlign: 'right',
              renderCell: (p) => <Button size="small" onClick={(e) => { e.stopPropagation(); openEdit(p.row); }}>Editar</Button> },
          ]} />
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar especialidad' : 'Nueva especialidad'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <TextField label="Codigo" fullWidth required margin="dense" size="small"
            helperText="Ej: ODONTOLOGIA (mayusculas, sin espacios)"
            value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} />
          <TextField label="Nombre" fullWidth required margin="dense" size="small"
            value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => { setFormError(''); saveMutation.mutate(form); }}
            disabled={saveMutation.isPending || !form.codigo || !form.nombre}>
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

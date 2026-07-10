import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, TextField, Alert } from '@mui/material';
import { SideDrawer, DrawerSection, DrawerActions } from '../SideDrawer';
import pacienteService from '../../services/pacienteService';
import { useNotify } from '../../context/NotificationContext';
import { validar, requerido, esTelefono, soloTelefono, erroresDelBackend } from '../../utils/validacion';

// ============================================================================
// Alta rápida de paciente — tarea "Paciente · Nueva Alta Rápida".
// Solo Nombre + Teléfono; el resto del expediente se llena después.
// Reutilizable: se abre desde el buscador de Pacientes y desde el flujo de
// Nueva Cita. Al guardar, notifica al padre con el paciente creado (onCreado)
// para dejarlo seleccionado sin salir del flujo.
// ============================================================================

const REGLAS = {
  nombre: [requerido],
  telefono: [requerido, esTelefono], // en alta rápida el teléfono SÍ es obligatorio
};

export default function AltaRapidaDrawer({ open, onClose, onCreado, nombreInicial = '' }) {
  const qc = useQueryClient();
  const notify = useNotify();
  const [form, setForm] = useState({ nombre: nombreInicial, telefono: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');

  const mutation = useMutation({
    mutationFn: (payload) => pacienteService.altaRapida(payload),
    onSuccess: (paciente) => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      notify.success('Paciente creado.');
      onCreado?.(paciente);
      cerrar();
    },
    onError: (err) => {
      // Errores de campo del backend → resaltar el campo; el resto → mensaje general.
      const { errores: campos, mensaje } = erroresDelBackend(err, { nombre: 'nombre', telefono: 'telefono' });
      setErrores(campos);
      // Solo mostramos mensaje general si no hubo errores de campo específicos.
      setErrorGeneral(Object.keys(campos).length ? '' : mensaje);
    },
  });

  function cerrar() {
    setForm({ nombre: '', telefono: '' });
    setErrores({});
    setErrorGeneral('');
    onClose();
  }

  function guardar() {
    setErrorGeneral('');
    const errs = validar(form, REGLAS);
    setErrores(errs);
    if (Object.keys(errs).length) return;
    mutation.mutate({ nombre: form.nombre.trim(), telefono: form.telefono.trim() });
  }

  const set = (campo) => (e) => {
    const v = campo === 'telefono' ? soloTelefono(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [campo]: v }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  return (
    <SideDrawer
      open={open}
      onClose={cerrar}
      width="sm"
      title="Nuevo paciente"
      subtitle="El expediente completo se llena después"
      footer={
        <DrawerActions
          onSave={guardar}
          onCancel={cerrar}
          saveLabel="Crear paciente"
          savingLabel="Creando…"
          saving={mutation.isPending}
        />
      }
    >
      <DrawerSection label="Datos mínimos">
        {errorGeneral && <Alert severity="error" sx={{ mb: 2 }}>{errorGeneral}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nombre completo" required autoFocus size="small" fullWidth
            placeholder="Ej. María López Herrera"
            value={form.nombre} onChange={set('nombre')}
            error={!!errores.nombre} helperText={errores.nombre || ' '}
          />
          <TextField
            label="Teléfono" required size="small" fullWidth
            placeholder="55 1234 5678" inputMode="tel"
            value={form.telefono} onChange={set('telefono')}
            error={!!errores.telefono} helperText={errores.telefono || ' '}
          />
        </Box>
      </DrawerSection>
    </SideDrawer>
  );
}

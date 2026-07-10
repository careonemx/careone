import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, TextField, Autocomplete, Alert } from '@mui/material';
import { SideDrawer, DrawerSection, DrawerActions } from '../SideDrawer';
import bloqueoService from '../../services/bloqueoService';
import { useNotify } from '../../context/NotificationContext';
import { erroresDelBackend } from '../../utils/validacion';

// ============================================================================
// Bloquear horario — tarea "Agenda · Bloquear horario". Reserva un espacio de
// tiempo sin crear cita/paciente/expediente. Motivo opcional (Comida, Junta…).
// ============================================================================

const MOTIVOS = ['Comida', 'Vacaciones', 'Junta', 'Capacitación', 'No disponible'];

export default function BloquearHorarioDrawer({ open, onClose, fecha: fechaInit, onSaved }) {
  const qc = useQueryClient();
  const notify = useNotify();
  const [fecha, setFecha] = useState(fechaInit || '');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload) => bloqueoService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agenda'] });
      qc.invalidateQueries({ queryKey: ['bloqueos-rango'] });
      notify.success('Horario bloqueado.');
      onSaved?.();
      onClose();
    },
    onError: (err) => setError(erroresDelBackend(err).mensaje),
  });

  function guardar() {
    setError('');
    if (!fecha) { setError('La fecha es obligatoria.'); return; }
    if (!horaInicio || !horaFin) { setError('Indica la hora de inicio y de fin.'); return; }
    if (horaFin <= horaInicio) { setError('La hora de fin debe ser posterior a la de inicio.'); return; }
    mutation.mutate({
      fecha,
      horaInicio: horaInicio + ':00',
      horaFin: horaFin + ':00',
      motivo: motivo || null,
    });
  }

  return (
    <SideDrawer
      open={open} onClose={onClose} width="sm"
      title="Bloquear horario"
      subtitle="Reserva tiempo sin agendar una cita"
      footer={
        <DrawerActions
          onSave={guardar} onCancel={onClose}
          saveLabel="Bloquear" savingLabel="Bloqueando…" saving={mutation.isPending}
        />
      }
    >
      <DrawerSection label="Periodo">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Fecha" type="date" size="small" fullWidth required
          InputLabelProps={{ shrink: true }}
          value={fecha} onChange={(e) => setFecha(e.target.value)}
        />
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
          <TextField
            label="Hora de inicio" type="time" size="small" fullWidth required
            InputLabelProps={{ shrink: true }}
            value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}
          />
          <TextField
            label="Hora de fin" type="time" size="small" fullWidth required
            InputLabelProps={{ shrink: true }}
            value={horaFin} onChange={(e) => setHoraFin(e.target.value)}
          />
        </Box>
      </DrawerSection>

      <DrawerSection label="Motivo (opcional)">
        <Autocomplete
          freeSolo options={MOTIVOS} value={motivo}
          onChange={(_, v) => setMotivo(v || '')}
          onInputChange={(_, v) => setMotivo(v)}
          renderInput={(params) => (
            <TextField {...params} size="small" placeholder="Ej. Comida, Junta, Vacaciones…" />
          )}
        />
      </DrawerSection>
    </SideDrawer>
  );
}

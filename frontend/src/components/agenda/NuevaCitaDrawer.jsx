import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, TextField, Autocomplete, MenuItem, Alert, Button } from '@mui/material';
import { SideDrawer, DrawerSection, DrawerActions } from '../SideDrawer';
import AltaRapidaDrawer from '../pacientes/AltaRapidaDrawer';
import { Icon } from '../Icon';
import citaService from '../../services/citaService';
import pacienteService from '../../services/pacienteService';
import doctorService from '../../services/doctorService';
import { useNotify } from '../../context/NotificationContext';
import { erroresDelBackend } from '../../utils/validacion';
import { tokens } from '../../theme';

// ============================================================================
// Nueva Cita (drawer) — tarea "Agenda · Simplificar drawer de Nueva Cita".
// Flujo mínimo: Paciente + Fecha + Hora + Observaciones. Sin tipo de cita,
// duración, monto ni recordatorio WhatsApp (la duración la pone la clínica,
// el recordatorio usa su configuración). Doctor: se oculta si hay uno solo.
// Reutilizable desde cualquier módulo (tarea "Nueva Cita desde cualquier módulo").
//
// Props:
//   open, onClose
//   fecha, hora           → prellenados (ej. al hacer clic en un slot de la agenda)
//   pacienteFijo          → si viene, el paciente queda preseleccionado y no se busca
//   onSaved(cita)         → callback tras crear
// ============================================================================

export default function NuevaCitaDrawer({ open, onClose, fecha: fechaInit, hora: horaInit, pacienteFijo = null, onSaved }) {
  const qc = useQueryClient();
  const notify = useNotify();
  const [paciente, setPaciente] = useState(pacienteFijo);
  const [busqueda, setBusqueda] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [fecha, setFecha] = useState(fechaInit || '');
  const [hora, setHora] = useState(horaInit || '');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [altaRapidaOpen, setAltaRapidaOpen] = useState(false);

  // El estado se inicializa desde props: el padre remonta el drawer con una `key`
  // en cada apertura (ver NuevaCitaHost), por lo que no hace falta sincronizar.

  const doctoresQuery = useQuery({ queryKey: ['personal', 'doctores'], queryFn: () => doctorService.listar(), enabled: open });
  const doctores = doctoresQuery.data || [];
  const unSoloDoctor = doctores.length === 1;

  // Búsqueda de pacientes por nombre o teléfono (solo si no hay paciente fijo).
  const pacientesQuery = useQuery({
    queryKey: ['pacientes', busqueda],
    queryFn: () => pacienteService.listar({ q: busqueda, size: 20 }),
    enabled: open && !pacienteFijo && busqueda.trim().length >= 2,
  });
  const opciones = pacientesQuery.data?.content || [];
  const sinResultados = busqueda.trim().length >= 2 && !pacientesQuery.isLoading && opciones.length === 0;

  const saveMutation = useMutation({
    mutationFn: (payload) => citaService.crear(payload),
    onSuccess: (cita) => {
      qc.invalidateQueries({ queryKey: ['agenda'] });
      qc.invalidateQueries({ queryKey: ['citas-rango'] });
      notify.success('Cita agendada.');
      onSaved?.(cita);
      onClose();
    },
    onError: (err) => {
      const { mensaje } = erroresDelBackend(err);
      setError(mensaje);
    },
  });

  function guardar() {
    setError('');
    if (!paciente) { setError('Selecciona un paciente.'); return; }
    if (!fecha) { setError('La fecha es obligatoria.'); return; }
    if (!hora) { setError('La hora es obligatoria.'); return; }
    if (!unSoloDoctor && !doctorId) { setError('Selecciona un doctor.'); return; }
    saveMutation.mutate({
      pacienteId: paciente.id,
      // Si hay un solo doctor, el backend lo asigna solo (mandamos null).
      doctorId: unSoloDoctor ? null : Number(doctorId),
      fecha,
      horaInicio: hora + ':00',
      // duración omitida a propósito → el backend usa la default de la clínica.
      notas: observaciones || null,
      tratamiento: 'Consulta',
    });
  }

  return (
    <>
      <SideDrawer
        open={open}
        onClose={onClose}
        title="Nueva cita"
        subtitle={pacienteFijo ? paciente?.nombre : 'Agenda en segundos'}
        footer={
          <DrawerActions
            onSave={guardar} onCancel={onClose}
            saveLabel="Guardar cita" savingLabel="Agendando…"
            saving={saveMutation.isPending}
          />
        }
      >
        {/* Paciente */}
        <DrawerSection label="Paciente">
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {pacienteFijo ? (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: tokens.neutral[50], border: `1px solid ${tokens.neutral[200]}`, fontWeight: 600 }}>
              {paciente?.nombre} {paciente?.apellidos || ''}
            </Box>
          ) : (
            <>
              <Autocomplete
                options={opciones}
                filterOptions={(x) => x} // el filtrado lo hace el backend
                getOptionLabel={(o) => `${o.nombre} ${o.apellidos || ''}`.trim() + (o.telefono ? ` · ${o.telefono}` : '')}
                value={paciente}
                onChange={(_, v) => setPaciente(v)}
                onInputChange={(_, v) => setBusqueda(v)}
                loading={pacientesQuery.isLoading}
                noOptionsText={busqueda.trim().length < 2 ? 'Escribe para buscar…' : 'No encontramos pacientes.'}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={(params) => (
                  <TextField {...params} label="Buscar por nombre o teléfono" size="small" required autoFocus />
                )}
              />
              {sinResultados && (
                <Button
                  size="small" startIcon={<Icon name="nuevo" size={15} />}
                  onClick={() => setAltaRapidaOpen(true)} sx={{ mt: 1 }}
                >
                  Nuevo paciente
                </Button>
              )}
            </>
          )}
        </DrawerSection>

        {/* Cita */}
        <DrawerSection label="Cita">
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              label="Fecha" type="date" size="small" fullWidth required
              InputLabelProps={{ shrink: true }}
              value={fecha} onChange={(e) => setFecha(e.target.value)}
            />
            <TextField
              label="Hora" type="time" size="small" fullWidth required
              InputLabelProps={{ shrink: true }}
              value={hora} onChange={(e) => setHora(e.target.value)}
            />
          </Box>

          {/* Doctor: solo si hay más de uno (si hay uno, se asigna automáticamente). */}
          {!unSoloDoctor && (
            <TextField
              label="Doctor" select size="small" fullWidth required margin="dense"
              value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
              sx={{ mt: 1.5 }}
            >
              {doctores.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.nombre} {d.apellidos || ''}</MenuItem>
              ))}
            </TextField>
          )}
        </DrawerSection>

        {/* Observaciones */}
        <DrawerSection label="Observaciones (opcional)">
          <TextField
            fullWidth size="small" multiline minRows={2}
            placeholder="Ej. Dolor molar inferior izquierdo"
            value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
          />
        </DrawerSection>
      </SideDrawer>

      {/* Alta rápida anidada: al crear, queda seleccionado y seguimos agendando. */}
      <AltaRapidaDrawer
        open={altaRapidaOpen}
        onClose={() => setAltaRapidaOpen(false)}
        nombreInicial={busqueda.trim()}
        onCreado={(nuevo) => { setPaciente(nuevo); setBusqueda(''); }}
      />
    </>
  );
}

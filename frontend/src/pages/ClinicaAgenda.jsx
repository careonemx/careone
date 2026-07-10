import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip, IconButton, CircularProgress, Alert, Menu, MenuItem,
} from '@mui/material';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableCita, DroppableSlot } from '../components/agenda/dnd';
import ConfirmarReagendaDialog from '../components/agenda/ConfirmarReagendaDialog';
import citaService from '../services/citaService';
import bloqueoService from '../services/bloqueoService';
import VistaSemanal from '../components/agenda/VistaSemanal';
import VistaMensual from '../components/agenda/VistaMensual';
import BloquearHorarioDrawer from '../components/agenda/BloquearHorarioDrawer';
import AlertasClinicas from '../components/agenda/AlertasClinicas';
import { SideDrawer, DrawerSection } from '../components/SideDrawer';
import { Icon } from '../components/Icon';
import { useNotify } from '../context/NotificationContext';
import { useNuevaCita } from '../context/NuevaCitaContext';
import { palette, tokens } from '../theme';

const hoy = () => new Date().toISOString().slice(0, 10);
const fmtFecha = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
const hhmm = (t) => (t ? t.slice(0, 5) : '');

const ESTADO_META = {
  AGENDADA: { label: 'Sin confirmar', bg: palette.amberLight, fg: '#92400E' },
  CONFIRMADA: { label: 'Confirmada', bg: palette.greenLight, fg: '#15803D' },
  EN_CONSULTA: { label: 'En consulta', bg: palette.blueLight, fg: '#1D4ED8' },
  COMPLETADA: { label: 'Completada', bg: '#F3F4F6', fg: '#4B5563' },
  NO_ASISTIO: { label: 'No asistio', bg: palette.redLight, fg: palette.red },
};

export default function ClinicaAgenda() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  // Estado en la URL: así al ir a Pacientes y volver (botón atrás), la Agenda
  // se restaura exactamente (fecha, vista, cita abierta). Tarea "preservar contexto".
  const [params, setParams] = useSearchParams();
  const fecha = params.get('fecha') || hoy();
  const vista = params.get('vista') || 'diaria';
  const citaAbiertaId = params.get('cita');
  const { abrirNuevaCita } = useNuevaCita();

  const setFecha = (f) => setParams((p) => { p.set('fecha', f); return p; }, { replace: true });
  const setVista = (v) => setParams((p) => { p.set('vista', v); return p; }, { replace: true });
  const abrirDrawerCita = (c) => setParams((p) => { p.set('cita', String(c.id)); return p; }, { replace: true });
  const cerrarDrawerCita = () => setParams((p) => { p.delete('cita'); return p; }, { replace: true });

  const [bloqueoOpen, setBloqueoOpen] = useState(false);

  const agendaQuery = useQuery({ queryKey: ['agenda', fecha], queryFn: () => citaService.agendaDelDia(fecha), enabled: vista === 'diaria' });
  // Bloqueos del día (se muestran como bloque gris, sin permitir agendar encima).
  const bloqueosQuery = useQuery({ queryKey: ['bloqueos-rango', fecha, fecha], queryFn: () => bloqueoService.rango(fecha, fecha), enabled: vista === 'diaria' });

  // La cita del drawer se resuelve desde el id en la URL (sobrevive a navegación).
  const drawerCita = (agendaQuery.data?.citas || []).find((c) => String(c.id) === citaAbiertaId) || null;

  const notify = useNotify();
  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }) => citaService.cambiarEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agenda'] }); cerrarDrawerCita(); notify.success('Cita actualizada.'); },
    onError: (err) => notify.error(err?.response?.data?.message || 'No se pudo actualizar.'),
  });

  const eliminarBloqueo = useMutation({
    mutationFn: (id) => bloqueoService.eliminar(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bloqueos-rango'] }); qc.invalidateQueries({ queryKey: ['agenda'] }); notify.success('Bloqueo eliminado.'); },
    onError: (err) => notify.error(err?.response?.data?.message || 'No se pudo eliminar.'),
  });

  // --- Reagendar por Drag & Drop: al soltar se propone (no se guarda hasta confirmar) ---
  const [propuesta, setPropuesta] = useState(null); // { citaId, pacienteNombre, fecha, horaInicio, duracionMin }

  const reagendarMutation = useMutation({
    mutationFn: ({ citaId, fecha, horaInicio, duracionMin }) =>
      citaService.reagendar(citaId, { fecha, horaInicio: horaInicio, duracionMin }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agenda'] }); setPropuesta(null); notify.success('Cita reagendada.'); },
    onError: (err) => { notify.error(err?.response?.data?.message || 'No se pudo reagendar.'); setPropuesta(null); },
  });

  // Sensor: solo arrastra tras mover 8px → el clic normal en la tarjeta sigue vivo.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const alSoltar = (e) => {
    const cita = e.active?.data?.current?.cita;
    const horaDestino = e.over?.data?.current?.hora; // "HH:MM:SS" del slot
    if (!cita || !horaDestino) return; // soltó fuera de un slot válido
    if (hhmm(horaDestino) === hhmm(cita.horaInicio) && fecha === cita.fecha) return; // sin cambio
    setPropuesta({
      citaId: cita.id, pacienteNombre: cita.pacienteNombre,
      fecha, horaInicio: hhmm(horaDestino) + ':00', duracionMin: cita.duracionMin,
    });
  };

  // Avanza por dia/semana/mes segun la vista activa.
  const cambiarPeriodo = (delta) => {
    const d = new Date(fecha + 'T00:00:00');
    if (vista === 'semanal') d.setDate(d.getDate() + delta * 7);
    else if (vista === 'mensual') d.setMonth(d.getMonth() + delta);
    else d.setDate(d.getDate() + delta);
    setFecha(d.toISOString().slice(0, 10));
  };

  // Al hacer clic en un dia de semana/mes, vamos a la vista diaria de ese dia
  // (todo en un solo setParams para no pisarnos con replace).
  const irADia = (di) => setParams((p) => { p.set('fecha', di); p.set('vista', 'diaria'); p.delete('cita'); return p; }, { replace: true });
  // Desde una cita de la vista semanal: vista diaria de ese dia + drawer abierto.
  const irACita = (di, cita) => setParams((p) => { p.set('fecha', di); p.set('vista', 'diaria'); p.set('cita', String(cita.id)); return p; }, { replace: true });

  const fmtPeriodo = () => {
    if (vista === 'mensual') return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    if (vista === 'semanal') return 'Semana de ' + new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    return fmtFecha(fecha);
  };

  const data = agendaQuery.data;
  const citas = data?.citas || [];
  const slots = data?.slotsLibres || [];
  const bloqueos = bloqueosQuery.data || [];

  // Conflicto: ¿hay otra cita a esa hora (excluyendo la que movemos)?
  const conflictoPropuesta = !!propuesta && citas.some((c) =>
    c.id !== propuesta.citaId && hhmm(c.horaInicio) === hhmm(propuesta.horaInicio));

  // Mezclar citas, bloqueos y slots ordenados por hora para el timeline
  const timeline = [
    ...citas.map((c) => ({ tipo: 'cita', hora: c.horaInicio, data: c })),
    ...bloqueos.map((b) => ({ tipo: 'bloqueo', hora: b.horaInicio, data: b })),
    ...slots.map((s) => ({ tipo: 'slot', hora: s.horaInicio, data: s })),
  ].sort((a, b) => a.hora.localeCompare(b.hora));

  // Abre el drawer global de nueva cita, prellenando la fecha activa y la hora del slot.
  const abrirModal = (hora) => abrirNuevaCita({ fecha, hora: hhmm(hora) || '09:00' });

  return (
    <>
      {/* Topbar */}
      <Box sx={{ minHeight: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50, flexWrap: 'wrap', py: 1 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Agenda</Box>

        {/* Switcher de vista */}
        <Box sx={{ display: 'flex', bgcolor: palette.divider, borderRadius: 2, p: '3px', gap: '1px', ml: 1 }}>
          {[['diaria', 'Diaria'], ['semanal', 'Semanal'], ['mensual', 'Mensual']].map(([k, label]) => (
            <Box key={k} onClick={() => setVista(k)} sx={{
              px: 1.75, py: 0.625, borderRadius: 1.5, fontSize: 12.5, fontWeight: vista === k ? 600 : 500, cursor: 'pointer',
              color: vista === k ? palette.blue : palette.text2, bgcolor: vista === k ? palette.white : 'transparent',
              boxShadow: vista === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
            }}>{label}</Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
          <IconButton size="small" onClick={() => cambiarPeriodo(-1)}>‹</IconButton>
          <Box sx={{ fontSize: 13.5, fontWeight: 600, textTransform: 'capitalize', minWidth: 200, textAlign: 'center' }}>{fmtPeriodo()}</Box>
          <IconButton size="small" onClick={() => cambiarPeriodo(1)}>›</IconButton>
        </Box>
        {/* Solo en Agenda: bloquear horario. "Nueva cita" está en el botón flotante global. */}
        <Button variant="outlined" sx={{ ml: 'auto' }} startIcon={<Icon name="pendiente" size={16} />}
          onClick={() => setBloqueoOpen(true)}>Bloquear horario</Button>
      </Box>

      {vista === 'semanal' ? (
        <Box sx={{ p: 2.5 }}><VistaSemanal fecha={fecha} onDiaClick={irADia} onCitaClick={irACita} /></Box>
      ) : vista === 'mensual' ? (
        <Box sx={{ p: 2.5 }}><VistaMensual fecha={fecha} onDiaClick={irADia} /></Box>
      ) : (
      // Solo el calendario de citas: la info operativa (pendientes/resumen) vive en Inicio.
      // DndContext: arrastrar una cita a un slot libre la reagenda (con confirmación).
      <DndContext sensors={sensors} onDragEnd={alSoltar}>
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
          {agendaQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : agendaQuery.isError ? (
            <Alert severity="error">No se pudo cargar la agenda.</Alert>
          ) : timeline.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center', color: palette.text2, bgcolor: palette.white, borderRadius: 3, border: `1px solid ${palette.border}` }}>
              No hay citas para este dia.
            </Box>
          ) : timeline.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1.75, mb: 1 }}>
              <Box sx={{ width: 52, flexShrink: 0, pt: 1.75, textAlign: 'right' }}>
                <Box sx={{ fontSize: 12, fontWeight: 700, color: palette.text2 }}>{hhmm(item.hora)}</Box>
              </Box>
              {item.tipo === 'cita' ? (
                <DraggableCita cita={item.data}>
                  <ApptCard c={item.data}
                    onClick={() => abrirDrawerCita(item.data)}
                    onConfirmar={() => estadoMutation.mutate({ id: item.data.id, estado: 'CONFIRMADA' })}
                    onReagendar={() => abrirNuevaCita({ paciente: { id: item.data.pacienteId, nombre: item.data.pacienteNombre } })}
                    onVerExpediente={() => navigate(`/clinica/expediente/${item.data.pacienteId}`, { state: { volverA: `/clinica/agenda?${params.toString()}` } })}
                    onRegistrarPago={() => navigate('/clinica/pagos')}
                    onNoAsistio={() => { if (window.confirm('¿Marcar que el paciente no asistió?')) estadoMutation.mutate({ id: item.data.id, estado: 'NO_ASISTIO' }); }}
                    onCancelar={() => { if (window.confirm('¿Cancelar esta cita?')) estadoMutation.mutate({ id: item.data.id, estado: 'CANCELADA' }); }}
                  />
                </DraggableCita>
              ) : item.tipo === 'bloqueo' ? (
                <BloqueoCard b={item.data} onEliminar={() => { if (window.confirm('¿Eliminar este bloqueo?')) eliminarBloqueo.mutate(item.data.id); }} />
              ) : (
                <DroppableSlot hora={item.data.horaInicio}>
                  <SlotCard s={item.data} onClick={() => abrirModal(item.data.horaInicio)} />
                </DroppableSlot>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      </DndContext>
      )}

      {/* Drawer de detalle de la cita (estado, alertas, acciones, abrir paciente). */}
      <CitaDrawer
        cita={drawerCita}
        onClose={cerrarDrawerCita}
        onEstado={(estado) => estadoMutation.mutate({ id: drawerCita.id, estado })}
        onAbrirPaciente={() => {
          // Conserva el contexto de la Agenda en la URL de retorno (back vuelve aquí).
          navigate(`/clinica/expediente/${drawerCita.pacienteId}`, {
            state: { volverA: `/clinica/agenda?${params.toString()}` },
          });
        }}
        onRegistrarPago={() => navigate('/clinica/pagos')}
        onReagendar={() => abrirNuevaCita({ paciente: { id: drawerCita.pacienteId, nombre: drawerCita.pacienteNombre } })}
      />

      <BloquearHorarioDrawer
        key={bloqueoOpen ? fecha : 'cerrado'}
        open={bloqueoOpen} fecha={fecha}
        onClose={() => setBloqueoOpen(false)}
      />

      <ConfirmarReagendaDialog
        open={!!propuesta}
        propuesta={propuesta}
        hayConflicto={conflictoPropuesta}
        guardando={reagendarMutation.isPending}
        onConfirmar={() => reagendarMutation.mutate(propuesta)}
        onCancelar={() => setPropuesta(null)}
      />
    </>
  );
}

// Bloque gris de horario reservado (no es una cita). Se puede eliminar.
function BloqueoCard({ b, onEliminar }) {
  return (
    <Box sx={{
      flex: 1, bgcolor: tokens.neutral[100], border: `1px dashed ${tokens.neutral[300]}`, borderRadius: 3,
      p: '12px 16px', display: 'flex', alignItems: 'center', gap: 1.5,
    }}>
      <Icon name="pendiente" size={18} style={{ color: tokens.neutral[500], flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 13.5, fontWeight: 600, color: tokens.neutral[700] }}>
          {b.motivo || 'Horario bloqueado'}
        </Box>
        <Box sx={{ fontSize: 12, color: palette.text3 }}>
          {hhmm(b.horaInicio)} – {hhmm(b.horaFin)}{b.doctorNombre ? ` · ${b.doctorNombre}` : ''}
        </Box>
      </Box>
      <IconButton size="small" onClick={onEliminar} aria-label="Eliminar bloqueo">
        <Icon name="eliminar" size={16} />
      </IconButton>
    </Box>
  );
}

// Tarjeta de cita. Acciones frecuentes visibles (Confirmar / Reagendar); el resto
// en el menú ⋮. Clic en la tarjeta (fuera de los botones) abre el detalle.
function ApptCard({ c, onClick, onConfirmar, onReagendar, onVerExpediente, onRegistrarPago, onNoAsistio, onCancelar }) {
  const [menuAncla, setMenuAncla] = useState(null);
  const meta = ESTADO_META[c.estado] || ESTADO_META.COMPLETADA;
  const dim = c.estado === 'COMPLETADA' || c.estado === 'NO_ASISTIO' || c.estado === 'CANCELADA';
  const activa = c.estado === 'AGENDADA' || c.estado === 'CONFIRMADA';

  const stop = (fn) => (e) => { e.stopPropagation(); setMenuAncla(null); fn(); };
  const cerrarMenu = (e) => { e?.stopPropagation(); setMenuAncla(null); };

  // Acciones frecuentes en la tarjeta (sin duplicar en el menú).
  const puedeConfirmar = c.estado === 'AGENDADA';
  const puedeReagendar = activa;

  return (
    <Box onClick={onClick} sx={{
      flex: 1, bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3,
      p: '14px 16px', display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)', opacity: dim ? 0.65 : 1,
      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,.09)', borderColor: '#D1D5DB' },
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 14.5, fontWeight: 700 }}>{c.pacienteNombre}</Box>
        {/* Alertas clínicas debajo del nombre (nacen de la historia clínica). Máx 2 + "+N". */}
        {c.alertas?.length > 0 && (
          <Box sx={{ mt: 0.5, mb: 0.25 }}><AlertasClinicas alertas={c.alertas} limite={2} /></Box>
        )}
        <Box sx={{ fontSize: 13, color: '#374151' }}>{c.tratamiento}</Box>
        <Box sx={{ fontSize: 12, color: palette.text3 }}>{c.doctorNombre}{c.primeraVez ? ' · Primera cita' : ''}</Box>
      </Box>

      {/* Estado */}
      <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.fg, fontWeight: 600, flexShrink: 0 }} />

      {/* Acciones frecuentes */}
      {puedeConfirmar && (
        <Button size="small" variant="outlined" startIcon={<Icon name="confirmar" size={15} />}
          onClick={stop(onConfirmar)} sx={{ flexShrink: 0 }}>Confirmar</Button>
      )}
      {puedeReagendar && (
        <Button size="small" variant="outlined" startIcon={<Icon name="reagendar" size={15} />}
          onClick={stop(onReagendar)} sx={{ flexShrink: 0 }}>Reagendar</Button>
      )}

      {/* Menú de más acciones */}
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAncla(e.currentTarget); }}
        aria-label="Más acciones" sx={{ flexShrink: 0 }}>
        <Icon name="masAcciones" size={18} />
      </IconButton>
      <Menu anchorEl={menuAncla} open={!!menuAncla} onClose={cerrarMenu} onClick={(e) => e.stopPropagation()}>
        <MenuItem onClick={stop(onVerExpediente)}><Icon name="paciente" size={16} style={{ marginRight: 10 }} />Ver expediente</MenuItem>
        {activa && <MenuItem onClick={stop(onRegistrarPago)}><Icon name="registrarPago" size={16} style={{ marginRight: 10 }} />Registrar pago</MenuItem>}
        {activa && <MenuItem onClick={stop(onNoAsistio)}><Icon name="noAsistio" size={16} style={{ marginRight: 10 }} />Marcar no asistió</MenuItem>}
        {activa && <MenuItem onClick={stop(onCancelar)} sx={{ color: palette.red }}><Icon name="cancelar" size={16} style={{ marginRight: 10 }} />Cancelar cita</MenuItem>}
      </Menu>
    </Box>
  );
}

function SlotCard({ s, onClick }) {
  return (
    <Box onClick={onClick} sx={{
      flex: 1, bgcolor: palette.greenBg, border: '1.5px solid #A7F3D0', borderRadius: 3,
      p: '14px 18px', display: 'flex', alignItems: 'center', gap: 1.75, cursor: 'pointer',
      '&:hover': { bgcolor: palette.greenLight, borderColor: '#6EE7B7' },
    }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ fontSize: 10.5, fontWeight: 700, color: palette.green, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Disponible</Box>
        <Box sx={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>{hhmm(s.horaInicio)} – {hhmm(s.horaFin)}</Box>
        <Box sx={{ fontSize: 12, color: palette.green }}>{s.minutos} min libres</Box>
      </Box>
      <Box sx={{ fontSize: 12, fontWeight: 600, color: palette.green }}>+ Agendar</Box>
    </Box>
  );
}

// Drawer de detalle de la cita. Muestra datos + alertas clínicas + acciones,
// incluida "Abrir paciente" (navega a Pacientes conservando el contexto de Agenda).
function CitaDrawer({ cita: c, onEstado, onClose, onAbrirPaciente, onRegistrarPago, onReagendar }) {
  if (!c) return <SideDrawer open={false} onClose={onClose} title="" />;
  const meta = ESTADO_META[c.estado] || ESTADO_META.COMPLETADA;

  // Cambios de estado disponibles según el estado actual.
  const cambios = {
    AGENDADA: [['Confirmar cita', 'CONFIRMADA', true], ['Marcar no asistió', 'NO_ASISTIO', false], ['Cancelar cita', 'CANCELADA', false]],
    CONFIRMADA: [['Completar cita', 'COMPLETADA', true], ['Marcar no asistió', 'NO_ASISTIO', false], ['Cancelar cita', 'CANCELADA', false]],
    COMPLETADA: [],
    NO_ASISTIO: [],
  }[c.estado] || [];

  const CONFIRMAR = {
    CANCELADA: '¿Cancelar esta cita? Quedará registrada pero saldrá del timeline.',
    NO_ASISTIO: '¿Marcar que el paciente no asistió?',
  };
  const ejecutar = (estado) => {
    const msg = CONFIRMAR[estado];
    if (msg && !window.confirm(msg)) return;
    onEstado(estado);
  };

  const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX');
  const fechaTxt = c.fecha ? new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <SideDrawer open onClose={onClose} title="Cita" subtitle={`#${c.id}`}>
      {/* Paciente + estado */}
      <DrawerSection>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontSize: 17, fontWeight: 700 }}>{c.pacienteNombre}</Box>
            {c.primeraVez && <Box sx={{ fontSize: 12, color: palette.text3 }}>Primera vez</Box>}
          </Box>
          <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.fg, fontWeight: 600 }} />
        </Box>
        {/* Alertas clínicas: TODAS, solo lectura, nacen de la historia clínica. */}
        {c.alertas?.length > 0 && (
          <Box sx={{ mt: 1.75 }}>
            <Box sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: palette.text3, mb: 0.75 }}>
              Alertas clínicas
            </Box>
            <AlertasClinicas alertas={c.alertas} />
            <Box sx={{ fontSize: 11.5, color: palette.text3, mt: 0.75 }}>Desde el expediente del paciente</Box>
          </Box>
        )}
      </DrawerSection>

      {/* Detalle */}
      <DrawerSection label="Detalle de la cita">
        <Row k="Doctor" v={c.doctorNombre} />
        <Row k="Fecha" v={fechaTxt} />
        <Row k="Hora" v={`${hhmm(c.horaInicio)} – ${hhmm(c.horaFin)} (${c.duracionMin} min)`} />
        {c.tratamiento && <Row k="Tratamiento" v={c.tratamiento} />}
        {c.monto != null && <Row k="Monto" v={money(c.monto)} />}
        {(c.motivo || c.notas) && <Row k="Observaciones" v={c.motivo || c.notas} />}
      </DrawerSection>

      {/* Acciones */}
      <DrawerSection label="Acciones">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {cambios.map(([label, estado, primary]) => (
            <Button key={estado} fullWidth variant={primary ? 'contained' : 'outlined'}
              color={estado === 'CANCELADA' ? 'error' : 'primary'}
              startIcon={<Icon name={estado === 'CONFIRMADA' ? 'confirmar' : estado === 'CANCELADA' ? 'cancelar' : estado === 'NO_ASISTIO' ? 'noAsistio' : 'completado'} size={16} />}
              onClick={() => ejecutar(estado)}>{label}</Button>
          ))}
          {c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA' && (
            <Button fullWidth variant="outlined" startIcon={<Icon name="reagendar" size={16} />} onClick={onReagendar}>
              Reagendar cita
            </Button>
          )}
          <Button fullWidth variant="outlined" startIcon={<Icon name="registrarPago" size={16} />} onClick={onRegistrarPago}>
            Registrar pago
          </Button>
          <Button fullWidth variant="outlined" startIcon={<Icon name="paciente" size={16} />} onClick={onAbrirPaciente}>
            Abrir paciente
          </Button>
        </Box>
      </DrawerSection>
    </SideDrawer>
  );
}

function Row({ k, v }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, mb: 0.75 }}>
      <Box sx={{ fontSize: 11.5, color: palette.text3, width: 76, flexShrink: 0 }}>{k}</Box>
      <Box sx={{ fontSize: 13, fontWeight: 500 }}>{v}</Box>
    </Box>
  );
}


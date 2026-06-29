import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Chip, IconButton, TextField, MenuItem, CircularProgress, Alert,
  Drawer, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete,
} from '@mui/material';
import citaService from '../services/citaService';
import pacienteService from '../services/pacienteService';
import doctorService from '../services/doctorService';
import tipoCitaService from '../services/tipoCitaService';
import VistaSemanal from '../components/agenda/VistaSemanal';
import VistaMensual from '../components/agenda/VistaMensual';
import { useNotify } from '../context/NotificationContext';
import { palette } from '../theme';

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
  const [fecha, setFecha] = useState(hoy());
  const [vista, setVista] = useState('diaria');
  const [drawerCita, setDrawerCita] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHora, setModalHora] = useState('09:00');

  const agendaQuery = useQuery({ queryKey: ['agenda', fecha], queryFn: () => citaService.agendaDelDia(fecha), enabled: vista === 'diaria' });

  const notify = useNotify();
  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }) => citaService.cambiarEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agenda'] }); setDrawerCita(null); notify.success('Cita actualizada.'); },
    onError: (err) => notify.error(err?.response?.data?.message || 'No se pudo actualizar.'),
  });

  // Avanza por dia/semana/mes segun la vista activa.
  const cambiarPeriodo = (delta) => {
    const d = new Date(fecha + 'T00:00:00');
    if (vista === 'semanal') d.setDate(d.getDate() + delta * 7);
    else if (vista === 'mensual') d.setMonth(d.getMonth() + delta);
    else d.setDate(d.getDate() + delta);
    setFecha(d.toISOString().slice(0, 10));
  };

  // Al hacer clic en un dia de semana/mes, vamos a la vista diaria de ese dia.
  const irADia = (di) => { setFecha(di); setVista('diaria'); };

  const fmtPeriodo = () => {
    if (vista === 'mensual') return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    if (vista === 'semanal') return 'Semana de ' + new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    return fmtFecha(fecha);
  };

  const data = agendaQuery.data;
  const citas = data?.citas || [];
  const slots = data?.slotsLibres || [];

  // Mezclar citas y slots ordenados por hora para el timeline
  const timeline = [
    ...citas.map((c) => ({ tipo: 'cita', hora: c.horaInicio, data: c })),
    ...slots.map((s) => ({ tipo: 'slot', hora: s.horaInicio, data: s })),
  ].sort((a, b) => a.hora.localeCompare(b.hora));

  const abrirModal = (hora) => { setModalHora(hhmm(hora) || '09:00'); setModalOpen(true); };

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
        <Button variant="contained" sx={{ ml: 'auto' }} onClick={() => abrirModal('09:00')}>+ Nueva cita</Button>
      </Box>

      {vista === 'semanal' ? (
        <Box sx={{ p: 2.5 }}><VistaSemanal fecha={fecha} onDiaClick={irADia} /></Box>
      ) : vista === 'mensual' ? (
        <Box sx={{ p: 2.5 }}><VistaMensual fecha={fecha} onDiaClick={irADia} /></Box>
      ) : (
      <Box sx={{ display: 'flex', gap: 2.5, p: 2.5, alignItems: 'flex-start' }}>
        {/* Timeline */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
              {item.tipo === 'cita' ? <ApptCard c={item.data} onClick={() => setDrawerCita(item.data)}
                onConfirmar={() => estadoMutation.mutate({ id: item.data.id, estado: 'CONFIRMADA' })}
                onReagendar={() => setDrawerCita(item.data)} />
                : <SlotCard s={item.data} onClick={() => abrirModal(item.data.horaInicio)} />}
            </Box>
          ))}
        </Box>

        {/* Panel derecho */}
        <Box sx={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <PanelPendientes data={data} onConfirmar={(id) => estadoMutation.mutate({ id, estado: 'CONFIRMADA' })} />
          <PanelResumen resumen={data?.resumen} />
        </Box>
      </Box>
      )}

      {/* Drawer del paciente / cita */}
      <Drawer anchor="right" open={!!drawerCita} onClose={() => setDrawerCita(null)}
        PaperProps={{ sx: { width: { xs: '90%', sm: 440 } } }}>
        {drawerCita && <CitaDrawer c={drawerCita} onEstado={(estado) => estadoMutation.mutate({ id: drawerCita.id, estado })} onClose={() => setDrawerCita(null)} />}
      </Drawer>

      {/* Modal nueva cita */}
      <NuevaCitaModal open={modalOpen} fecha={fecha} hora={modalHora} onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ['agenda'] }); }} />
    </>
  );
}

function ApptCard({ c, onClick, onConfirmar }) {
  const meta = ESTADO_META[c.estado] || ESTADO_META.COMPLETADA;
  const dim = c.estado === 'COMPLETADA' || c.estado === 'NO_ASISTIO';
  return (
    <Box onClick={onClick} sx={{
      flex: 1, bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3,
      p: '14px 16px', display: 'flex', alignItems: 'center', gap: 1.75, cursor: 'pointer',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)', opacity: dim ? 0.65 : 1,
      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,.09)', borderColor: '#D1D5DB' },
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 14.5, fontWeight: 700 }}>{c.pacienteNombre}</Box>
        <Box sx={{ fontSize: 13, color: '#374151' }}>{c.tratamiento}</Box>
        <Box sx={{ fontSize: 12, color: palette.text3 }}>{c.doctorNombre}{c.primeraVez ? ' · Primera cita' : ''}</Box>
        {c.pacienteAlergias && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.75, fontSize: 11.5, fontWeight: 600, color: palette.red, px: 1, py: 0.4, bgcolor: palette.redLight, borderRadius: 1 }}>
            ⚠ {c.pacienteAlergias}
          </Box>
        )}
      </Box>
      {c.estado === 'AGENDADA'
        ? <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onConfirmar(); }}>Confirmar cita</Button>
        : <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.fg, fontWeight: 600 }} />}
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

function PanelPendientes({ data, onConfirmar }) {
  if (!data) return null;
  const grupos = [
    { titulo: 'Cobros pendientes', items: data.cobrosPendientes, accion: null },
    { titulo: 'Confirmaciones', items: data.confirmacionesPendientes, accion: 'confirmar' },
    { titulo: 'Reagendaciones', items: data.reagendaciones, accion: null },
  ].filter((g) => g.items && g.items.length);
  return (
    <Box sx={{ bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3, p: 2 }}>
      <Box sx={{ fontSize: 11, fontWeight: 700, color: palette.text3, textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1.5 }}>Pendientes</Box>
      {grupos.length === 0 && <Box sx={{ fontSize: 12.5, color: palette.text2 }}>Nada pendiente.</Box>}
      {grupos.map((g) => (
        <Box key={g.titulo} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
          <Box sx={{ fontSize: 11, fontWeight: 600, color: palette.text2, mb: 1, pb: 0.75, borderBottom: `1px solid ${palette.divider}` }}>
            {g.titulo} <span style={{ float: 'right', color: palette.text3 }}>{g.items.length}</span>
          </Box>
          {g.items.map((it) => (
            <Box key={it.citaId} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.pacienteNombre}</Box>
                <Box sx={{ fontSize: 11, color: palette.text2 }}>{it.detalle}</Box>
              </Box>
              {g.accion === 'confirmar' && <Button size="small" variant="outlined" sx={{ fontSize: 11, py: 0.25 }} onClick={() => onConfirmar(it.citaId)}>Confirmar</Button>}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function PanelResumen({ resumen }) {
  if (!resumen) return null;
  const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX');
  return (
    <Box sx={{ bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3, p: 2 }}>
      <Box sx={{ fontSize: 11, fontWeight: 700, color: palette.text3, textTransform: 'uppercase', letterSpacing: '0.6px', mb: 1.5 }}>Resumen de hoy</Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
        <Metric val={resumen.totalCitas} lbl="Citas" />
        <Metric val={money(resumen.montoProgramado)} lbl="Programado" />
      </Box>
      <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 1.25 }}>
        <Box sx={{ fontSize: 17, fontWeight: 800, color: palette.green }}>{money(resumen.montoCobrado)}</Box>
        <Box sx={{ fontSize: 10.5, color: palette.text3 }}>Cobrado hoy</Box>
      </Box>
    </Box>
  );
}

function Metric({ val, lbl }) {
  return (
    <Box sx={{ bgcolor: '#F9FAFB', borderRadius: 2, p: 1.25 }}>
      <Box sx={{ fontSize: 17, fontWeight: 800 }}>{val}</Box>
      <Box sx={{ fontSize: 10.5, color: palette.text3 }}>{lbl}</Box>
    </Box>
  );
}

function CitaDrawer({ c, onEstado, onClose }) {
  const meta = ESTADO_META[c.estado] || ESTADO_META.COMPLETADA;
  const acciones = {
    AGENDADA: [['Confirmar cita', 'CONFIRMADA', true], ['Marcar no asistio', 'NO_ASISTIO', false], ['Cancelar cita', 'CANCELADA', false]],
    CONFIRMADA: [['Completar cita', 'COMPLETADA', true], ['Marcar no asistio', 'NO_ASISTIO', false], ['Cancelar cita', 'CANCELADA', false]],
    COMPLETADA: [],
    NO_ASISTIO: [['Reagendar cita', 'AGENDADA', true]],
  }[c.estado] || [];

  // Las acciones destructivas piden confirmacion explicita.
  const CONFIRMAR = {
    CANCELADA: '¿Cancelar esta cita? Quedara registrada pero saldra del timeline.',
    NO_ASISTIO: '¿Marcar que el paciente no asistio?',
  };
  const ejecutar = (estado) => {
    const msg = CONFIRMAR[estado];
    if (msg && !window.confirm(msg)) return;
    onEstado(estado);
  };
  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Box sx={{ fontSize: 17, fontWeight: 700 }}>{c.pacienteNombre}</Box>
          <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.fg, fontWeight: 600, mt: 0.5 }} />
        </Box>
        <Button size="small" onClick={onClose}>✕</Button>
      </Box>
      {c.pacienteAlergias && <Alert severity="error" sx={{ mb: 2 }}>{c.pacienteAlergias}</Alert>}
      {acciones.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {acciones.map(([label, estado, primary]) => (
            <Button key={estado} variant={primary ? 'contained' : 'outlined'}
              color={estado === 'CANCELADA' ? 'error' : 'primary'}
              size="small" onClick={() => ejecutar(estado)}>{label}</Button>
          ))}
        </Box>
      )}
      <Box sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1 }}>Cita</Box>
      <Row k="Tratamiento" v={c.tratamiento} />
      <Row k="Doctor" v={c.doctorNombre} />
      <Row k="Horario" v={`${hhmm(c.horaInicio)} – ${hhmm(c.horaFin)}`} />
      <Row k="Duracion" v={`${c.duracionMin} min`} />
      {c.monto != null && <Row k="Monto" v={`$${Number(c.monto).toLocaleString('es-MX')}`} />}
    </Box>
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

function NuevaCitaModal({ open, fecha, hora, onClose, onSaved }) {
  const [paciente, setPaciente] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [tipoCitaId, setTipoCitaId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [duracion, setDuracion] = useState(45);
  const [monto, setMonto] = useState('');
  const [canal, setCanal] = useState('WHATSAPP');
  const [recordatorio, setRecordatorio] = useState(true);
  const [error, setError] = useState('');

  const pacientesQuery = useQuery({ queryKey: ['pacientes', ''], queryFn: () => pacienteService.listar({ size: 100 }), enabled: open });
  const doctoresQuery = useQuery({ queryKey: ['personal', 'doctores'], queryFn: () => doctorService.listar(), enabled: open });
  const tiposQuery = useQuery({ queryKey: ['tipos-cita', 'activos'], queryFn: () => tipoCitaService.listarActivos(), enabled: open });

  const saveMutation = useMutation({
    mutationFn: (payload) => citaService.crear(payload),
    onSuccess: onSaved,
    onError: (err) => setError(err?.response?.data?.message || 'No se pudo agendar.'),
  });

  // Al elegir tipo de cita, sugiere su duracion por defecto.
  const onTipoChange = (id) => {
    setTipoCitaId(id);
    const tipo = (tiposQuery.data || []).find((t) => t.id === Number(id));
    if (tipo?.duracionDefault) setDuracion(tipo.duracionDefault);
  };

  const handleSave = () => {
    setError('');
    saveMutation.mutate({
      pacienteId: paciente?.id, doctorId: Number(doctorId),
      tipoCitaId: tipoCitaId ? Number(tipoCitaId) : null,
      motivo: motivo || null,
      tratamiento: motivo || 'Consulta',
      fecha, horaInicio: hora + ':00', duracionMin: Number(duracion),
      monto: monto ? Number(monto) : null,
      canalConfirmacion: canal,
      recordatorioWhatsapp: recordatorio,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nueva cita · {hora}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Autocomplete
          options={pacientesQuery.data?.content || []}
          getOptionLabel={(o) => `${o.nombre} ${o.apellidos || ''}`.trim()}
          value={paciente} onChange={(_, v) => setPaciente(v)}
          renderInput={(params) => <TextField {...params} label="Paciente" margin="dense" size="small" required />}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="Doctor" select fullWidth required margin="dense" size="small"
            value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            {(doctoresQuery.data || []).map((d) => <MenuItem key={d.id} value={d.id}>{d.nombre} {d.apellidos}</MenuItem>)}
          </TextField>
          <TextField label="Tipo de cita" select fullWidth margin="dense" size="small"
            value={tipoCitaId} onChange={(e) => onTipoChange(e.target.value)}>
            <MenuItem value="">—</MenuItem>
            {(tiposQuery.data || []).map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
          </TextField>
        </Box>
        <TextField label="Motivo (opcional)" fullWidth margin="dense" size="small" placeholder="Ej. Dolor molar inferior izquierdo"
          value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="Duracion" select fullWidth margin="dense" size="small"
            value={duracion} onChange={(e) => setDuracion(e.target.value)}>
            {[15, 30, 45, 60, 90, 120].map((d) => <MenuItem key={d} value={d}>{d} min</MenuItem>)}
          </TextField>
          <TextField label="Monto (opcional)" type="number" fullWidth margin="dense" size="small"
            value={monto} onChange={(e) => setMonto(e.target.value)} />
        </Box>
        <TextField label="Canal de confirmacion" select fullWidth margin="dense" size="small"
          value={canal} onChange={(e) => setCanal(e.target.value)}>
          <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
          <MenuItem value="EMAIL">Email</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <input type="checkbox" checked={recordatorio} onChange={(e) => setRecordatorio(e.target.checked)} />
          <Box sx={{ fontSize: 13 }}>Recordatorio automatico (24h y 2h antes)</Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending || !paciente || !doctorId}>
          {saveMutation.isPending ? 'Agendando...' : 'Agendar cita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

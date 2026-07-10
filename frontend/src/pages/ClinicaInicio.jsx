import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Chip, CircularProgress, Alert } from '@mui/material';
import inicioService from '../services/inicioService';
import citaService from '../services/citaService';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { palette } from '../theme';

const hoy = () => new Date().toISOString().slice(0, 10);
const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX');
const hhmm = (t) => (t ? t.slice(0, 5) : '');
const fechaLarga = () => new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

const ESTADO_META = {
  AGENDADA: { label: 'Sin confirmar', bg: palette.amberLight, fg: '#92400E', bar: palette.amber },
  CONFIRMADA: { label: 'Confirmada', bg: palette.greenLight, fg: '#15803D', bar: '#22C55E' },
  EN_CONSULTA: { label: 'En consulta', bg: palette.blueLight, fg: '#1D4ED8', bar: palette.blue },
  COMPLETADA: { label: 'Completada', bg: '#F3F4F6', fg: '#4B5563', bar: '#E5E7EB' },
  NO_ASISTIO: { label: 'No asistio', bg: palette.redLight, fg: palette.red, bar: palette.red },
};

// Color del icono de cada tarjeta inteligente (NO cambia la paleta, la reusa).
const TARJETA_COLOR = {
  CONFIRMACIONES: { bg: palette.amberLight, fg: palette.amber },
  COBRANZA: { bg: palette.redLight, fg: palette.red },
  INASISTENCIAS: { bg: palette.blueLight, fg: palette.blue },
  REVISIONES: { bg: palette.greenLight, fg: palette.green },
};

export default function ClinicaInicio() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notify = useNotify();

  const query = useQuery({ queryKey: ['inicio', hoy()], queryFn: () => inicioService.resumen(hoy()) });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }) => citaService.cambiarEstado(id, estado),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inicio'] }); notify.success('Cita actualizada.'); },
  });

  if (query.isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (query.isError) return <Box sx={{ p: 4 }}><Alert severity="error">No se pudo cargar el inicio.</Alert></Box>;

  const data = query.data;
  const nombrePila = (user?.nombre || '').split(' ')[0] || 'Hola';

  return (
    <>
      {/* Topbar: saludo + accesos rapidos */}
      <Box sx={{ minHeight: 72, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box>
          <Box sx={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px' }}>{data.saludo?.split('·')[0]?.trim()}, {nombrePila}</Box>
          <Box sx={{ fontSize: 12.5, color: palette.text3, textTransform: 'capitalize' }}>
            {fechaLarga()}{data.saludo?.includes('·') ? ' · ' + data.saludo.split('·')[1].trim() : ''}
          </Box>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/clinica/pacientes')}>+ Nuevo paciente</Button>
        </Box>
      </Box>

      <Box sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* KPIs */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 1.5 }}>
          <Kpi val={data.kpis.citasHoy} label="Citas hoy" color={palette.blue} bg={palette.blueLight} onClick={() => navigate('/clinica/agenda')} />
          <Kpi val={data.kpis.confirmadas} label="Confirmadas" color={palette.green} bg={palette.greenLight} onClick={() => navigate('/clinica/agenda')} />
          <Kpi val={money(data.kpis.ingresoEsperado)} label="Ingreso esperado" color={palette.purple} bg={palette.purpleLight} />
          <Kpi val={money(data.kpis.cobradoHoy)} label="Cobrado hoy" color={palette.amber} bg={palette.amberLight} onClick={() => navigate('/clinica/pagos')} />
        </Box>

        {/* Tarjetas inteligentes */}
        {data.tarjetas.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: palette.text3, mt: 1 }}>
              Acciones prioritarias
            </Box>
            {data.tarjetas.map((t) => (
              <TarjetaInteligente key={t.clave} t={t}
                onConfirmar={(id) => estadoMutation.mutate({ id, estado: 'CONFIRMADA' })}
                onPaciente={(pid) => navigate(`/clinica/expediente/${pid}`)} />
            ))}
          </Box>
        )}

        {/* Agenda del dia */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 1 }}>
            <Box sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: palette.text3 }}>Agenda de hoy</Box>
            <Box sx={{ ml: 'auto', fontSize: 12.5, fontWeight: 600, color: palette.blue, cursor: 'pointer' }} onClick={() => navigate('/clinica/agenda')}>
              Ver agenda completa ›
            </Box>
          </Box>
          <Box sx={{ bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
            {data.agenda.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: palette.text2 }}>
                No tienes citas programadas para hoy.
                <Box sx={{ mt: 1.5 }}><Button variant="contained" size="small" onClick={() => navigate('/clinica/agenda')}>+ Nueva cita</Button></Box>
              </Box>
            ) : data.agenda.map((c) => <FilaAgenda key={c.id} c={c} onClick={() => navigate(`/clinica/expediente/${c.pacienteId}`)} />)}
          </Box>
        </Box>
      </Box>
    </>
  );
}

function Kpi({ val, label, color, bg, onClick }) {
  return (
    <Box onClick={onClick} sx={{
      bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3, p: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 1.75, cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow .15s', '&:hover': onClick ? { boxShadow: '0 4px 16px rgba(0,0,0,.07)' } : {},
    }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
      </Box>
      <Box>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{val}</Box>
        <Box sx={{ fontSize: 13, color: palette.text2, fontWeight: 500, mt: 0.5 }}>{label}</Box>
      </Box>
    </Box>
  );
}

function TarjetaInteligente({ t, onConfirmar, onPaciente }) {
  const col = TARJETA_COLOR[t.clave] || { bg: palette.divider, fg: palette.text2 };
  const [abierta, setAbierta] = useState(false);
  return (
    <Box sx={{ bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '14px 18px', cursor: 'pointer' }} onClick={() => setAbierta((v) => !v)}>
        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: col.bg, color: col.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {t.cantidad}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 13.5, fontWeight: 700 }}>{t.titulo}</Box>
          <Box sx={{ fontSize: 12, color: palette.text3 }}>{t.descripcion}</Box>
        </Box>
        <Box sx={{ fontSize: 12, color: palette.blue, fontWeight: 600 }}>{abierta ? 'Ocultar' : 'Ver'}</Box>
      </Box>
      {abierta && (
        <Box sx={{ borderTop: `1px solid ${palette.divider}` }}>
          {t.items.map((it) => (
            <Box key={it.citaId + '-' + it.pacienteId} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: '10px 18px', borderBottom: `1px solid ${palette.divider}`, '&:last-child': { borderBottom: 'none' } }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.pacienteNombre}</Box>
                <Box sx={{ fontSize: 11.5, color: palette.text3 }}>{it.detalle}</Box>
              </Box>
              {t.clave === 'CONFIRMACIONES' && <Button size="small" variant="outlined" onClick={() => onConfirmar(it.citaId)}>Confirmar</Button>}
              {(t.clave === 'COBRANZA' || t.clave === 'INASISTENCIAS' || t.clave === 'REVISIONES') &&
                <Button size="small" onClick={() => onPaciente(it.pacienteId)}>Abrir</Button>}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function FilaAgenda({ c, onClick }) {
  const meta = ESTADO_META[c.estado] || ESTADO_META.COMPLETADA;
  const dim = c.estado === 'COMPLETADA' || c.estado === 'NO_ASISTIO';
  return (
    <Box onClick={onClick} sx={{
      display: 'grid', gridTemplateColumns: '64px 4px 1fr auto', alignItems: 'center', gap: 2,
      p: '14px 20px', borderBottom: `1px solid ${palette.divider}`, cursor: 'pointer',
      opacity: dim ? 0.55 : 1, '&:last-child': { borderBottom: 'none' }, '&:hover': { bgcolor: '#FAFAFA' },
    }}>
      <Box sx={{ fontSize: 12.5, fontWeight: 700, color: palette.text3, textAlign: 'right' }}>{hhmm(c.horaInicio)}</Box>
      <Box sx={{ width: 3, height: 36, borderRadius: 1, bgcolor: meta.bar }} />
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.pacienteNombre}
          {c.primeraVez && <Chip label="Nuevo" size="small" sx={{ ml: 1, height: 18, fontSize: 10, bgcolor: palette.greenLight, color: palette.green }} />}
        </Box>
        <Box sx={{ fontSize: 12, color: palette.text3 }}>
          {c.tipoCitaNombre || c.tratamiento} · {c.doctorNombre}
          {c.pacienteAlergias && <Box component="span" sx={{ color: palette.red, fontWeight: 600 }}> · ⚠ {c.pacienteAlergias}</Box>}
        </Box>
      </Box>
      <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.fg, fontWeight: 600 }} />
    </Box>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Alert } from '@mui/material';
import citaService from '../../services/citaService';
import { palette } from '../../theme';

const hhmm = (t) => (t ? t.slice(0, 5) : '');
const iso = (d) => d.toISOString().slice(0, 10);

const ESTADO_BAR = {
  AGENDADA: palette.amber, CONFIRMADA: '#22C55E', EN_CONSULTA: palette.blue,
  COMPLETADA: '#E5E7EB', NO_ASISTIO: palette.red,
};
const DIAS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

// Lunes de la semana que contiene `fecha`.
function lunesDe(fechaIso) {
  const d = new Date(fechaIso + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dow);
  return d;
}

export default function VistaSemanal({ fecha, onDiaClick }) {
  const lunes = lunesDe(fecha);
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(lunes); d.setDate(d.getDate() + i); return d; });
  const desde = iso(dias[0]);
  const hasta = iso(dias[6]);

  const query = useQuery({ queryKey: ['citas-rango', desde, hasta], queryFn: () => citaService.rango(desde, hasta) });

  if (query.isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (query.isError) return <Alert severity="error">No se pudo cargar la semana.</Alert>;

  const citas = query.data || [];
  const porDia = {};
  citas.forEach((c) => { (porDia[c.fecha] = porDia[c.fecha] || []).push(c); });
  const hoyIso = new Date().toISOString().slice(0, 10);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
      {dias.map((d, i) => {
        const di = iso(d);
        const lista = (porDia[di] || []).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
        const esHoy = di === hoyIso;
        return (
          <Box key={di} sx={{ bgcolor: palette.white, border: `1px solid ${esHoy ? palette.blue : palette.border}`, borderRadius: 2, overflow: 'hidden', minHeight: 240 }}>
            <Box onClick={() => onDiaClick?.(di)} sx={{ p: 1, textAlign: 'center', borderBottom: `1px solid ${palette.divider}`, cursor: 'pointer', bgcolor: esHoy ? palette.blueLight : 'transparent' }}>
              <Box sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: palette.text3 }}>{DIAS[i]}</Box>
              <Box sx={{ fontSize: 16, fontWeight: 800, color: esHoy ? palette.blue : palette.text }}>{d.getDate()}</Box>
            </Box>
            <Box sx={{ p: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {lista.length === 0 ? (
                <Box sx={{ fontSize: 11, color: palette.text3, textAlign: 'center', py: 1 }}>—</Box>
              ) : lista.map((c) => (
                <Box key={c.id} onClick={() => onDiaClick?.(di)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: '4px 6px', borderRadius: 1, bgcolor: '#FAFAFA', cursor: 'pointer', '&:hover': { bgcolor: palette.divider } }}>
                  <Box sx={{ width: 3, alignSelf: 'stretch', borderRadius: 1, bgcolor: ESTADO_BAR[c.estado] || '#E5E7EB' }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ fontSize: 10.5, fontWeight: 700, color: palette.text2 }}>{hhmm(c.horaInicio)}</Box>
                    <Box sx={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.pacienteNombre}</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

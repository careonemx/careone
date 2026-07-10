import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Alert, IconButton } from '@mui/material';
import citaService from '../../services/citaService';
import { Icon } from '../Icon';
import { useNuevaCita } from '../../context/NuevaCitaContext';
import { palette, tokens } from '../../theme';

const hhmm = (t) => (t ? t.slice(0, 5) : '');
const iso = (d) => d.toISOString().slice(0, 10);

const DIAS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

// Lunes de la semana que contiene `fecha`.
function lunesDe(fechaIso) {
  const d = new Date(fechaIso + 'T00:00:00');
  const dow = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dow);
  return d;
}

// onDiaClick(fechaIso)         -> ir a la agenda diaria de ese día
// onCitaClick(fechaIso, cita)  -> abrir esa cita en la vista diaria
export default function VistaSemanal({ fecha, onDiaClick, onCitaClick }) {
  const { abrirNuevaCita } = useNuevaCita();
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
          <Box key={di} sx={{
            bgcolor: palette.white, borderRadius: 2, overflow: 'hidden', minHeight: 260,
            border: `1px solid ${esHoy ? palette.blue : palette.border}`,
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Cabecera del día: número en círculo navy si es hoy (consistente con vista mensual). */}
            <Box onClick={() => onDiaClick?.(di)} sx={{
              p: 1, textAlign: 'center', borderBottom: `1px solid ${palette.divider}`, cursor: 'pointer',
              bgcolor: esHoy ? palette.blueLight : 'transparent',
            }}>
              <Box sx={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: palette.text3 }}>{DIAS[i]}</Box>
              {esHoy ? (
                <Box sx={{ mt: 0.5, mx: 'auto', width: 26, height: 26, borderRadius: '50%', bgcolor: palette.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                  {d.getDate()}
                </Box>
              ) : (
                <Box sx={{ fontSize: 16, fontWeight: 700, color: palette.text }}>{d.getDate()}</Box>
              )}
            </Box>

            {/* Citas del día */}
            <Box sx={{ p: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
              {lista.map((c) => (
                <Box key={c.id}
                  onClick={() => onCitaClick?.(di, c)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: '5px 7px', borderRadius: 1.5, bgcolor: tokens.neutral[50], cursor: 'pointer', '&:hover': { bgcolor: tokens.neutral[100] } }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ fontSize: 10.5, fontWeight: 700, color: palette.text2 }}>{hhmm(c.horaInicio)}</Box>
                    <Box sx={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.pacienteNombre}</Box>
                    {/* Doctor visible para identificarlo cuando hay varios. */}
                    <Box sx={{ fontSize: 10, color: palette.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.doctorNombre}</Box>
                  </Box>
                  {c.alertas?.length > 0 && <Icon name="alertaClinica" size={13} style={{ color: tokens.danger.solid, flexShrink: 0 }} />}
                </Box>
              ))}
            </Box>

            {/* Crear cita en este día (horario libre). */}
            <Box sx={{ p: 0.5, borderTop: `1px solid ${palette.divider}` }}>
              <IconButton
                size="small" onClick={() => abrirNuevaCita({ fecha: di })}
                aria-label={`Nueva cita el ${di}`}
                sx={{ width: '100%', borderRadius: 1.5, color: tokens.success.text, fontSize: 12, '&:hover': { bgcolor: tokens.success.soft } }}
              >
                <Icon name="nuevo" size={15} style={{ marginRight: 4 }} />
                <Box component="span" sx={{ fontSize: 11.5, fontWeight: 600 }}>Cita</Box>
              </IconButton>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

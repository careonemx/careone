import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Alert } from '@mui/material';
import citaService from '../../services/citaService';
import { palette, tokens } from '../../theme';

const iso = (d) => d.toISOString().slice(0, 10);
const DIAS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

export default function VistaMensual({ fecha, onDiaClick }) {
  const base = new Date(fecha + 'T00:00:00');
  const anio = base.getFullYear();
  const mes = base.getMonth();
  const primero = new Date(anio, mes, 1);
  // Rango de la grilla: desde el lunes previo al dia 1, hasta completar 6 semanas.
  const offset = (primero.getDay() + 6) % 7;
  const inicioGrid = new Date(anio, mes, 1 - offset);
  const celdas = Array.from({ length: 42 }, (_, i) => { const d = new Date(inicioGrid); d.setDate(d.getDate() + i); return d; });

  const desde = iso(celdas[0]);
  const hasta = iso(celdas[41]);
  const query = useQuery({ queryKey: ['citas-rango', desde, hasta], queryFn: () => citaService.rango(desde, hasta) });

  if (query.isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  if (query.isError) return <Alert severity="error">No se pudo cargar el mes.</Alert>;

  const conteo = {};
  (query.data || []).forEach((c) => { conteo[c.fecha] = (conteo[c.fecha] || 0) + 1; });
  const hoyIso = new Date().toISOString().slice(0, 10);

  return (
    <Box sx={{ bgcolor: palette.white, border: `1px solid ${palette.border}`, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${palette.divider}`, bgcolor: '#F9FAFB' }}>
        {DIAS.map((d) => <Box key={d} sx={{ p: 1, textAlign: 'center', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: palette.text3 }}>{d}</Box>)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {celdas.map((d, i) => {
          const di = iso(d);
          const esMes = d.getMonth() === mes;
          const esHoy = di === hoyIso;
          const n = conteo[di] || 0;
          return (
            <Box key={i} onClick={() => onDiaClick?.(di)} sx={{
              minHeight: 92, p: 1, borderRight: `1px solid ${palette.divider}`, borderBottom: `1px solid ${palette.divider}`,
              cursor: 'pointer', opacity: esMes ? 1 : 0.4, bgcolor: esHoy ? palette.blueLight : 'transparent',
              transition: 'background .12s', '&:hover': { bgcolor: esHoy ? palette.blueLight : '#FAFAFA' },
            }}>
              {/* Día actual: número en círculo navy para identificarlo de un vistazo. */}
              {esHoy ? (
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', bgcolor: palette.blue, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700,
                }}>{d.getDate()}</Box>
              ) : (
                <Box sx={{ fontSize: 12.5, fontWeight: 600, color: palette.text }}>{d.getDate()}</Box>
              )}
              {/* Solo la CARGA del día (nº de citas), en neutro: comunica cantidad, no estado. */}
              {n > 0 && (
                <Box sx={{ mt: 0.75, fontSize: 12, fontWeight: 600, color: tokens.neutral[600] }}>
                  {n} {n === 1 ? 'cita' : 'citas'}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

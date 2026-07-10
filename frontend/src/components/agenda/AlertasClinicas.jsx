import { Box } from '@mui/material';
import { Badge } from '../Badge';
import { tokens } from '../../theme';

// ============================================================================
// Alertas clínicas del paciente (tarea "Alertas clínicas en la vista diaria").
// NACEN de la historia clínica (backend deriva `cita.alertas` = [{etiqueta,nivel}]).
// ROJA → badge rojo (crítico); AMBAR → badge ámbar (a vigilar).
//
// - En la TARJETA de cita: max 2-3 badges (rojas primero) + contador "+N".
// - En el DRAWER de detalle: todas (limite alto), con leyenda de origen.
// ============================================================================

export default function AlertasClinicas({ alertas, limite = 99, gap = 0.75 }) {
  if (!alertas || alertas.length === 0) return null;
  // El backend ya las manda ordenadas (rojas primero); respetamos ese orden.
  const visibles = alertas.slice(0, limite);
  const restantes = alertas.length - visibles.length;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap }}>
      {visibles.map((a, i) => (
        <Badge key={i} variant={a.nivel === 'ROJA' ? 'clinica' : 'clinicaAmbar'}>{a.etiqueta}</Badge>
      ))}
      {restantes > 0 && (
        <Box component="span" sx={{
          display: 'inline-flex', alignItems: 'center', px: 1, borderRadius: 9999,
          fontSize: 12, fontWeight: 600, color: tokens.neutral[600], bgcolor: tokens.neutral[100],
        }}>
          +{restantes}
        </Box>
      )}
    </Box>
  );
}

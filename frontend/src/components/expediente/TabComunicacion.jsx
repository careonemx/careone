import { Box, Button, Chip, Paper } from '@mui/material';
import { palette } from '../../theme';

// MAQUETA: timeline de comunicacion (WhatsApp). Sin logica de envio real.
// El envio se habilita al final del desarrollo (modulo WhatsApp).
const EJEMPLOS = [
  { icon: 'wa', texto: 'Recordatorio de cita enviado', sub: 'Cita de manana · "Recuerda tu cita..."', badge: 'Entregado', time: 'Ayer 10:00' },
  { icon: 'wa', texto: 'Cita confirmada por el paciente', sub: 'Respondio "Si" al recordatorio', badge: 'Confirmada', time: 'Ayer 10:14' },
  { icon: 'sig', texto: 'Solicitud de firma enviada', sub: 'Consentimiento · enlace de firma', badge: 'Firmado', time: 'Hace 3 dias' },
];

export default function TabComunicacion() {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3 }}>Comunicacion</Box>
        <Chip label="Proximamente" size="small" sx={{ ml: 1, bgcolor: palette.amberLight, color: '#92400E', fontWeight: 600 }} />
        <Button size="small" variant="outlined" sx={{ ml: 'auto' }} disabled>Enviar WhatsApp</Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', opacity: 0.7 }}>
        {EJEMPLOS.map((e, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1.75, p: 2, borderBottom: i < EJEMPLOS.length - 1 ? `1px solid ${palette.divider}` : 'none' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: e.icon === 'wa' ? palette.greenLight : palette.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: e.icon === 'wa' ? palette.green : palette.blue }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontSize: 13, fontWeight: 500 }}>{e.texto}
                <Chip label={e.badge} size="small" sx={{ ml: 1, height: 18, fontSize: 10, bgcolor: palette.greenLight, color: '#15803D' }} /></Box>
              <Box sx={{ fontSize: 11.5, color: palette.text2 }}>{e.sub}</Box>
            </Box>
            <Box sx={{ fontSize: 11.5, color: palette.text3, flexShrink: 0 }}>{e.time}</Box>
          </Box>
        ))}
      </Paper>
      <Box sx={{ fontSize: 11.5, color: palette.text3, textAlign: 'center', mt: 1.5 }}>
        Ejemplo ilustrativo. El envio real de WhatsApp se habilitara al final del desarrollo.
      </Box>
    </>
  );
}

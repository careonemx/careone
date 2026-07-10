// ============================================================================
// Badge de estado — CareOne Design System v1.1 (Componentes MVP · Batch 1).
// Regla: cada badge = ícono + texto (nunca color solo, DS C6). Un hue por estado.
// Ámbar = adeudos/administrativo. Rojo = SOLO alerta clínica crítica.
// La lógica de "qué badge mostrar cuando hay varios" vive en cap. 5 del DS
// (un solo badge primario) — este componente solo pinta uno.
// ============================================================================
import { Box } from '@mui/material';
import { tokens, radius } from '../theme';
import { Icon } from './Icon';

// Variantes semánticas → { fondo soft, texto, borde, ícono por defecto }.
const VARIANTS = {
  // Cita / operativo
  confirmada: { bg: tokens.success.soft, fg: tokens.success.text, bd: '#A7F3D0', icon: 'confirmado' },
  completada: { bg: tokens.success.soft, fg: tokens.success.text, bd: '#A7F3D0', icon: 'completado' },
  agendada: { bg: tokens.neutral[100], fg: tokens.neutral[700], bd: tokens.neutral[200], icon: 'pendiente' },
  cancelada: { bg: tokens.neutral[100], fg: tokens.neutral[700], bd: tokens.neutral[200], icon: 'cancelado' },
  enConsulta: { bg: tokens.info.soft, fg: tokens.info.text, bd: tokens.cyan[100], icon: 'info' },
  noAsistio: { bg: tokens.warning.soft, fg: tokens.warning.text, bd: '#FDE68A', icon: 'noAsistio' },
  // Clínico / administrativo
  clinica: { bg: tokens.danger.soft, fg: tokens.danger.text, bd: '#FCA5A5', icon: 'alertaClinica' },
  clinicaAmbar: { bg: tokens.warning.soft, fg: tokens.warning.text, bd: '#FDE68A', icon: 'alertaAdmin' },
  adeudo: { bg: tokens.warning.soft, fg: tokens.warning.text, bd: '#FDE68A', icon: 'adeudo' },
  admin: { bg: tokens.warning.soft, fg: tokens.warning.text, bd: '#FDE68A', icon: 'alertaAdmin' },
  tratamiento: { bg: tokens.info.soft, fg: tokens.info.text, bd: tokens.cyan[100], icon: 'tratamientos' },
  info: { bg: tokens.info.soft, fg: tokens.info.text, bd: tokens.cyan[100], icon: 'info' },
  neutral: { bg: tokens.neutral[100], fg: tokens.neutral[700], bd: tokens.neutral[200], icon: 'documento' },
};

/**
 * <Badge variant="clinica">Alérgica a penicilina</Badge>
 * - variant: clave de VARIANTS (default "neutral").
 * - icon: sobreescribe el ícono por defecto de la variante (nombre del DS).
 * - Si no pasas children, muestra solo el ícono.
 */
export function Badge({ variant = 'neutral', icon, children, sx, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const iconName = icon || v.icon;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.625,
        px: 1.125, py: 0.375, borderRadius: `${radius.full}px`,
        fontSize: 12, fontWeight: 600, lineHeight: '16px', whiteSpace: 'nowrap',
        border: '1px solid', bgcolor: v.bg, color: v.fg, borderColor: v.bd,
        fontVariantNumeric: variant === 'adeudo' ? 'tabular-nums' : undefined,
        ...sx,
      }}
      {...rest}
    >
      {iconName && <Icon name={iconName} size={13} style={{ flexShrink: 0 }} />}
      {children}
    </Box>
  );
}

export default Badge;

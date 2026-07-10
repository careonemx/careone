// ============================================================================
// SideDrawer — patrón ESTÁNDAR de Drawer lateral de CareOne (Design System v1.1).
//
// Regla de diseño (tarea "UX · Estandarizar patrón de Drawer lateral"):
//   Toda acción rápida de crear, editar o consultar información se hace en un
//   Drawer lateral, NO en una pantalla completa. Solo se usan pantallas completas
//   para flujos complejos (Expediente, Odontograma, Configuración).
//
// Patrón (DS cap. 10/11): desliza desde la derecha, elevation/2, overlay con fade,
// motion/emphasized a la entrada. Estructura fija: Header (título + subtítulo +
// cerrar) · Body scrolleable · Footer opcional (acción primaria + secundaria).
//
// Uso:
//   <SideDrawer open={open} onClose={cerrar} title="Nueva cita" subtitle="…"
//       footer={<DrawerActions onSave={guardar} savingLabel="Guardando…" saving={m.isPending} onCancel={cerrar} />}>
//     …contenido / secciones con <DrawerSection> …
//   </SideDrawer>
// ============================================================================
import { Drawer, Box, IconButton, Button } from '@mui/material';
import { tokens, radius } from '../theme';
import { Icon } from './Icon';

const WIDTHS = { sm: 400, md: 440, lg: 520 };

export function SideDrawer({
  open, onClose, title, subtitle, children, footer,
  width = 'md', keepMounted = false,
}) {
  const w = WIDTHS[width] || WIDTHS.md;
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted={keepMounted}
      slotProps={{ backdrop: { sx: { bgcolor: 'rgba(15,23,42,.48)' } } }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: w }, maxWidth: '100vw',
          display: 'flex', flexDirection: 'column',
          borderLeft: `1px solid ${tokens.neutral[200]}`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, pt: 2.75, pb: 2.25, flexShrink: 0,
        borderBottom: `1px solid ${tokens.neutral[200]}`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
      }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontSize: 16, fontWeight: 700, color: tokens.neutral[900], lineHeight: 1.3 }}>
            {title}
          </Box>
          {subtitle && (
            <Box sx={{ fontSize: 12, color: tokens.neutral[600], mt: 0.5 }}>{subtitle}</Box>
          )}
        </Box>
        <IconButton
          onClick={onClose} aria-label="Cerrar"
          sx={{
            width: 28, height: 28, borderRadius: `${radius.sm}px`,
            border: `1px solid ${tokens.neutral[200]}`, color: tokens.neutral[600],
            '&:hover': { bgcolor: tokens.neutral[100] },
          }}
        >
          <Icon name="cerrar" size={14} />
        </IconButton>
      </Box>

      {/* Body scrolleable */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>{children}</Box>

      {/* Footer opcional */}
      {footer && (
        <Box sx={{
          px: 3, py: 2, flexShrink: 0,
          borderTop: `1px solid ${tokens.neutral[200]}`,
          display: 'flex', flexDirection: 'column', gap: 1,
        }}>
          {footer}
        </Box>
      )}
    </Drawer>
  );
}

/** Sección con overline (etiqueta) y separador inferior, para agrupar campos. */
export function DrawerSection({ label, children, sx }) {
  return (
    <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${tokens.neutral[200]}`, '&:last-of-type': { borderBottom: 'none' }, ...sx }}>
      {label && (
        <Box sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.neutral[400], mb: 1.5 }}>
          {label}
        </Box>
      )}
      {children}
    </Box>
  );
}

/** Par de botones estándar del footer: primario (guardar) + secundario (cancelar). */
export function DrawerActions({ onSave, onCancel, saveLabel = 'Guardar', savingLabel = 'Guardando…', cancelLabel = 'Cancelar', saving = false, saveDisabled = false, saveType = 'button' }) {
  return (
    <>
      <Button
        type={saveType} variant="contained" fullWidth disableElevation
        onClick={saveType === 'submit' ? undefined : onSave}
        disabled={saving || saveDisabled}
        startIcon={!saving && <Icon name="guardar" size={16} />}
        sx={{ py: 1.25, borderRadius: 2.25, fontWeight: 600 }}
      >
        {saving ? savingLabel : saveLabel}
      </Button>
      {onCancel && (
        <Button
          variant="text" fullWidth onClick={onCancel} disabled={saving}
          sx={{ py: 1, color: tokens.neutral[600], fontWeight: 500 }}
        >
          {cancelLabel}
        </Button>
      )}
    </>
  );
}

export default SideDrawer;

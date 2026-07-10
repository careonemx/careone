import { createTheme } from '@mui/material/styles';

// ============================================================================
// CareOne Product Design System v1.1 — Foundations (CONGELADO)
// Fuente de verdad: careone-design-system-v1.md + careone-design-system-preview.html
//
// Marca: Navy #0B2A6B (primario) · Cyan #00AAEE (acento).
// Neutrales: Slate. Ámbar = adeudos. Rojo = SOLO clínico crítico/destructivo.
// Los nombres de las claves de `palette` se conservan por compatibilidad con los
// componentes existentes; sus valores ahora apuntan a los tokens oficiales del DS.
// ============================================================================

// --- Rampas completas del DS (por si se necesitan tonos intermedios) ---
export const tokens = {
  neutral: {
    0: '#FFFFFF', 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
    400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A',
  },
  navy: {
    50: '#EEF2FB', 100: '#D8E1F5', 200: '#B3C4EB', 400: '#3F63BE',
    500: '#1E4BA5', 600: '#12377F', 700: '#0B2A6B', 900: '#071B45',
  },
  cyan: {
    50: '#E6F7FE', 100: '#CCEFFD', 300: '#66CDF6', 500: '#00AAEE', 600: '#0088BE', 700: '#00668F',
  },
  success: { soft: '#ECFDF5', solid: '#10B981', text: '#047857' },
  warning: { soft: '#FFFBEB', solid: '#F59E0B', text: '#B45309' },
  danger: { soft: '#FEF2F2', solid: '#EF4444', text: '#B91C1C' },
  info: { soft: '#E6F7FE', solid: '#00AAEE', text: '#00668F' },
};

// Radios y elevaciones oficiales (DS cap. 9 y 10).
export const radius = { sm: 6, md: 8, lg: 12, full: 9999 };
export const elevation = {
  0: 'none',
  1: '0 1px 2px rgba(15,23,42,.06),0 1px 3px rgba(15,23,42,.10)',
  2: '0 4px 12px rgba(15,23,42,.10)',
  3: '0 12px 32px rgba(15,23,42,.16)',
};

// --- `palette` de compatibilidad: mismas claves, valores del DS ---
export const palette = {
  // Marca (antes azul #2563EB → ahora Navy del DS)
  blue: tokens.navy[700],        // primario / botón primario
  blueLight: tokens.navy[50],    // fondo seleccionado / chip de marca sutil
  blueMid: tokens.navy[100],     // hover de superficies de marca
  // Acento
  cyan: tokens.cyan[500],
  cyanText: tokens.cyan[700],
  // Semánticos
  green: tokens.success.text,    // texto success (para contraste sobre soft)
  greenSolid: tokens.success.solid,
  greenLight: tokens.success.soft,
  greenBg: tokens.success.soft,
  red: tokens.danger.text,       // texto danger; sólido en danger.solid
  redSolid: tokens.danger.solid,
  redLight: tokens.danger.soft,
  amber: tokens.warning.text,    // adeudos / administrativo
  amberSolid: tokens.warning.solid,
  amberLight: tokens.warning.soft,
  // Info reusa cyan (no es un 6º hue)
  purple: tokens.cyan[600],
  purpleLight: tokens.cyan[50],
  // Superficies y neutrales
  bg: tokens.neutral[50],
  white: tokens.neutral[0],
  border: tokens.neutral[200],
  borderStrong: tokens.neutral[300],
  text: tokens.neutral[900],
  text2: tokens.neutral[600],
  text3: tokens.neutral[400],
  divider: tokens.neutral[100],
};

const FONT_UI = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FONT_BRAND = "'Poppins', 'Inter', sans-serif";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.navy[700], light: tokens.navy[50], dark: tokens.navy[600], contrastText: '#FFFFFF' },
    secondary: { main: tokens.cyan[500], light: tokens.cyan[50], dark: tokens.cyan[700], contrastText: '#FFFFFF' },
    success: { main: tokens.success.solid, light: tokens.success.soft, dark: tokens.success.text },
    error: { main: tokens.danger.solid, light: tokens.danger.soft, dark: tokens.danger.text },
    warning: { main: tokens.warning.solid, light: tokens.warning.soft, dark: tokens.warning.text },
    info: { main: tokens.info.solid, light: tokens.info.soft, dark: tokens.info.text },
    background: { default: tokens.neutral[50], paper: tokens.neutral[0] },
    text: { primary: tokens.neutral[900], secondary: tokens.neutral[600], disabled: tokens.neutral[400] },
    divider: tokens.neutral[200],
  },
  typography: {
    fontFamily: FONT_UI,
    fontSize: 14,
    // Encabezados de marca ≥20px → Poppins 600 (DS cap. 6, regla T1).
    h1: { fontFamily: FONT_BRAND, fontWeight: 600, fontSize: '24px', lineHeight: '32px', letterSpacing: '-0.01em' },
    h2: { fontFamily: FONT_BRAND, fontWeight: 600, fontSize: '20px', lineHeight: '28px' },
    h3: { fontFamily: FONT_UI, fontWeight: 600, fontSize: '18px', lineHeight: '26px' },
    body1: { fontFamily: FONT_UI, fontWeight: 400, fontSize: '14px', lineHeight: '20px' },
    body2: { fontFamily: FONT_UI, fontWeight: 400, fontSize: '13px', lineHeight: '18px' },
    caption: { fontFamily: FONT_UI, fontWeight: 500, fontSize: '12px', lineHeight: '16px' },
    overline: { fontFamily: FONT_UI, fontWeight: 600, fontSize: '11px', lineHeight: '16px', letterSpacing: '0.06em', textTransform: 'uppercase' },
    button: { fontFamily: FONT_UI, textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: radius.md },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.md, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiPaper: {
      // DS: plano por defecto (borde, no sombra). E1 de elevaciones.
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    // Drawer flota → elevation/2 (DS cap. 10).
    MuiDrawer: {
      styleOverrides: { paper: { borderRadius: 0, boxShadow: elevation[2] } },
    },
    // Modal/Dialog → elevation/3, overlay del DS.
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: radius.lg, boxShadow: elevation[3] } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: radius.full, fontWeight: 600 } },
    },
    // Foco siempre visible y cyan (DS regla C5).
    MuiCssBaseline: {
      styleOverrides: {
        ':focus-visible': { outline: `2px solid ${tokens.cyan[500]}`, outlineOffset: '2px' },
      },
    },
  },
});

export default theme;

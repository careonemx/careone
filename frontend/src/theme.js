import { createTheme } from '@mui/material/styles';

// Paleta tomada de paciente-v1.html / agenda-v3.html (variables :root).
// Mantener estos valores como fuente de verdad del diseno.
export const palette = {
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  blueMid: '#DBEAFE',
  green: '#16A34A',
  greenLight: '#DCFCE7',
  greenBg: '#F0FDF4',
  red: '#DC2626',
  redLight: '#FEF2F2',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  bg: '#F4F6F9',
  white: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  text2: '#6B7280',
  text3: '#9CA3AF',
  divider: '#F3F4F6',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: palette.blue, light: palette.blueLight, dark: '#1D4ED8' },
    success: { main: palette.green, light: palette.greenLight },
    error: { main: palette.red, light: palette.redLight },
    warning: { main: palette.amber, light: palette.amberLight },
    secondary: { main: palette.purple, light: palette.purpleLight },
    background: { default: palette.bg, paper: palette.white },
    text: { primary: palette.text, secondary: palette.text2, disabled: palette.text3 },
    divider: palette.border,
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    h1: { fontWeight: 800, letterSpacing: '-0.5px' },
    h2: { fontWeight: 800, letterSpacing: '-0.4px' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Alert, InputAdornment, IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { tokens } from '../theme';
import { Icon } from '../components/Icon';

// ============================================================================
// Login de CareOne — diseño login-v1.html adaptado al Design System v1.1.
// Panel de marca (navy) a la izquierda + formulario a la derecha.
// Colores del DS: Navy #0B2A6B primario · Cyan #00AAEE acento (NO el azul mockup).
// Nota: el HTML de referencia incluye botones Google/Apple; se OMITEN porque el
// backend no tiene OAuth (login real = email+password contra /auth/login).
// ============================================================================

const NAVY = tokens.navy[700];   // #0B2A6B
const CYAN = tokens.cyan[500];   // #00AAEE

export default function LoginSuperadmin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Si llegamos aqui por sesion expirada, lo mostramos una vez y limpiamos la marca.
  const [sesionExpirada] = useState(() => {
    const expiro = sessionStorage.getItem('careone_sesion_expirada') === '1';
    if (expiro) sessionStorage.removeItem('careone_sesion_expirada');
    return expiro;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.roles.includes('SUPERADMIN')) {
        navigate('/superadmin/clinicas', { replace: true });
      } else if (user.tenantId) {
        // ADMIN_CLINICA, DOCTOR, RECEPCIONISTA, AYUDANTE -> Inicio (centro de operaciones).
        navigate('/clinica/inicio', { replace: true });
      } else {
        navigate('/proximamente', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
      {/* ===== PANEL DE MARCA (navy) ===== */}
      <Box
        sx={{
          width: '46%', flexShrink: 0, bgcolor: NAVY, position: 'relative', overflow: 'hidden',
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', px: 6, py: 8,
        }}
      >
        {/* Grid de puntos + resplandor cyan */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, ${CYAN}24 1.5px, transparent 1.5px)`,
          backgroundSize: '30px 30px',
        }} />
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', width: 340, height: 340,
          transform: 'translate(-50%,-50%)', borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${CYAN}21 0%, transparent 68%)`,
        }} />

        <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LogoAnillos size={90} />
          <Box sx={{ mt: 2.5, fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
            Care<Box component="span" sx={{ color: CYAN }}>One</Box>
          </Box>
          <Box sx={{ mt: 1, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>
            Gestión clínica inteligente
          </Box>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 2, width: 36, height: '1.5px', bgcolor: `${CYAN}66`, my: 4 }} />

        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 220, textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 14.5, lineHeight: 1.75 }}>
          Tu clínica, en orden.<br />
          <Box component="strong" sx={{ color: CYAN, fontWeight: 600 }}>Menos papeleo.</Box><br />
          Más tiempo con tus pacientes.
        </Box>
      </Box>

      {/* ===== PANEL DE FORMULARIO ===== */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 5 }, py: 6 }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Logo compacto en móvil (el panel navy se oculta) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <LogoAnillos size={40} navy />
            <Box sx={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 700, color: NAVY, letterSpacing: '-0.5px' }}>
              Care<Box component="span" sx={{ color: CYAN }}>One</Box>
            </Box>
          </Box>

          <Box sx={{ mb: 3.5 }}>
            <Box sx={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, fontWeight: 700, color: NAVY }}>
              Bienvenido de vuelta
            </Box>
            <Box sx={{ fontSize: 13.5, color: tokens.neutral[500], mt: 0.5 }}>
              Inicia sesión para continuar
            </Box>
          </Box>

          {sesionExpirada && !error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Tu sesión expiró por inactividad. Vuelve a iniciar sesión.
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Campo
              label="Correo electrónico" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="dra.aide@clinica.mx"
              autoComplete="username" startIcon="email"
            />
            <Campo
              label="Contraseña" type={verPass ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              autoComplete="current-password" startIcon="contrasena"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton size="small" edge="end" onClick={() => setVerPass((v) => !v)}
                    aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    <Icon name={verPass ? 'ocultarPass' : 'verPass'} size={18} />
                  </IconButton>
                </InputAdornment>
              }
            />
            <Button
              type="submit" variant="contained" fullWidth disableElevation disabled={loading}
              sx={{ mt: 2.5, py: 1.25, fontSize: 14.5, fontWeight: 600, borderRadius: 2.5 }}
            >
              {loading ? 'Entrando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
}

// --- Campo de formulario con label + ícono, estilo DS ---
function Campo({ label, startIcon, endAdornment, ...inputProps }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box component="label" sx={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: tokens.neutral[700], mb: 0.75 }}>
        {label}
      </Box>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'absolute', left: 12, display: 'flex', color: tokens.neutral[400], pointerEvents: 'none' }}>
          <Icon name={startIcon} size={16} />
        </Box>
        <Box
          component="input"
          required
          {...inputProps}
          sx={{
            width: '100%', px: '14px', pl: '38px', py: '11px',
            borderRadius: '10px', border: `1px solid ${tokens.neutral[200]}`,
            bgcolor: tokens.neutral[50], fontSize: 14, fontFamily: 'inherit',
            color: tokens.neutral[900], outline: 'none', transition: 'border-color .15s, box-shadow .15s, background .15s',
            '&:focus': { borderColor: CYAN, bgcolor: '#fff', boxShadow: `0 0 0 3px ${CYAN}1A` },
            '&::placeholder': { color: tokens.neutral[400] },
          }}
        />
        {endAdornment && (
          <Box sx={{ position: 'absolute', right: 4, display: 'flex' }}>{endAdornment}</Box>
        )}
      </Box>
    </Box>
  );
}

// --- Logo de anillos C+O animado (del login-v1.html). navy=variante para móvil. ---
function LogoAnillos({ size = 90, navy = false }) {
  const bg = navy ? '#fff' : NAVY; // color del "recorte" que abre la C
  return (
    <Box
      component="svg"
      width={size} height={size} viewBox="0 0 100 100" aria-label="CareOne logo"
      sx={{
        '@media (prefers-reduced-motion: no-preference)': {
          '& .ringC': { strokeDasharray: 176, strokeDashoffset: 176, animation: 'drawRing .9s cubic-bezier(.4,0,.2,1) .1s forwards' },
          '& .ringO': { strokeDasharray: 138, strokeDashoffset: 138, animation: 'drawRing .9s cubic-bezier(.4,0,.2,1) .35s forwards' },
        },
        '@keyframes drawRing': { to: { strokeDashoffset: 0 } },
      }}
    >
      <circle cx="38" cy="50" r="28" stroke={navy ? NAVY : '#fff'} strokeWidth="9" strokeLinecap="round" fill="none" className="ringC" />
      <rect x="54" y="35" width="14" height="30" fill={bg} />
      <circle cx="62" cy="50" r="22" stroke={CYAN} strokeWidth="9" fill="none" className="ringO" />
    </Box>
  );
}

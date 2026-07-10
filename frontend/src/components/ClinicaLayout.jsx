import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { NuevaCitaProvider } from '../context/NuevaCitaContext';
import { palette } from '../theme';

// Iconos SVG inline fieles a agenda-v3.html / paciente-v1.html
const icons = {
  inicio: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  agenda: <path d="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" />,
  pacientes: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
  expedientes: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  pagos: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
  config: <><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></>,
};

const Icon = ({ d }) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">{d}</svg>
);

const navMain = [
  { to: '/clinica/inicio', label: 'Inicio', icon: icons.inicio },
  { to: '/clinica/agenda', label: 'Agenda', icon: icons.agenda },
  { to: '/clinica/pacientes', label: 'Pacientes', icon: icons.pacientes },
  { to: '/clinica/pagos', label: 'Caja', icon: icons.pagos },
];
const navSistema = [
  { to: '/clinica/personal', label: 'Personal', icon: icons.pacientes },
  { to: '/clinica/permisos', label: 'Permisos', icon: icons.config },
  { to: '/clinica/configuracion', label: 'Configuracion', icon: icons.config },
];

const SW = 208; // ancho del sidebar (estilo inicio-v6)

export default function ClinicaLayout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  // Solo el ADMIN_CLINICA administra personal/permisos/configuración.
  const esAdmin = hasRole('ADMIN_CLINICA');
  const [movilOpen, setMovilOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const cerrarMovil = () => setMovilOpen(false);

  const initials = (user?.nombre || 'AC').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const itemStyle = (isActive, disabled) => ({
    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
    color: disabled ? palette.text3 : isActive ? palette.blue : palette.text2,
    background: isActive && !disabled ? palette.blueLight : 'transparent',
    fontSize: 13, fontWeight: isActive ? 600 : 500, borderRadius: 8, marginBottom: 2,
    textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
  });

  const sidebar = (
    <>
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: 3, borderBottom: `1px solid ${palette.divider}` }}>
        <Box sx={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Care<Box component="span" sx={{ color: palette.blue }}>One</Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1, p: 1 }}>
        {navMain.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={cerrarMovil} style={({ isActive }) => itemStyle(isActive, false)}>
            <Icon d={item.icon} />{item.label}
          </NavLink>
        ))}
        {/* Sección Sistema: solo el ADMIN_CLINICA la ve. */}
        {esAdmin && (
          <>
            <Box sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: palette.text3, px: 1.5, pt: 2, pb: 0.625 }}>
              Sistema
            </Box>
            {navSistema.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={cerrarMovil} style={({ isActive }) => itemStyle(isActive, false)}>
                <Icon d={item.icon} />{item.label}
              </NavLink>
            ))}
          </>
        )}
      </Box>
      <Box sx={{ p: '14px 18px', borderTop: `1px solid ${palette.divider}`, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: palette.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
          {initials}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nombre || 'Admin'}</Box>
          <Box onClick={handleLogout} sx={{ fontSize: 11, color: palette.text3, cursor: 'pointer', '&:hover': { color: palette.red } }}>
            Cerrar sesion
          </Box>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: palette.bg }}>
      {/* Sidebar fijo en desktop; deslizable en movil */}
      <Box component="aside" sx={{
        width: SW, bgcolor: palette.white, borderRight: `1px solid ${palette.border}`,
        position: 'fixed', top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column', zIndex: 100,
        transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        transform: { xs: movilOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'none' },
        boxShadow: { xs: movilOpen ? '4px 0 40px rgba(0,0,0,.12)' : 'none', md: 'none' },
      }}>
        {sidebar}
      </Box>

      {/* Overlay para cerrar el sidebar en movil */}
      {movilOpen && (
        <Box onClick={cerrarMovil} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,.2)', zIndex: 99, display: { md: 'none' } }} />
      )}

      <NuevaCitaProvider>
        <Box component="main" sx={{ ml: { xs: 0, md: `${SW}px` }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
          {/* Barra superior movil con hamburguesa */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, height: 56, px: 2, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
            <Box onClick={() => setMovilOpen(true)} sx={{ width: 36, height: 36, borderRadius: 2, border: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" fill="none" stroke={palette.text2} strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </Box>
            <Box sx={{ fontSize: 16, fontWeight: 800 }}>Care<Box component="span" sx={{ color: palette.blue }}>One</Box></Box>
          </Box>
          {children}
        </Box>
      </NuevaCitaProvider>
    </Box>
  );
}

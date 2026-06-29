import { NavLink, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { palette } from '../theme';

const navItems = [
  { to: '/superadmin/clinicas', label: 'Clinicas' },
  { to: '/superadmin/especialidades', label: 'Especialidades' },
];

export default function SuperadminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.nombre || 'SA')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: palette.bg }}>
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 208,
          bgcolor: palette.white,
          borderRight: `1px solid ${palette.border}`,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', px: 2.5, borderBottom: `1px solid ${palette.divider}` }}>
          <Box sx={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.4px' }}>
            Care<Box component="span" sx={{ color: palette.blue }}>One</Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: 1.25 }}>
          <Box sx={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: palette.text3, px: 1.25, py: '14px 10px 5px' }}>
            Superadmin
          </Box>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 10px',
                color: isActive ? palette.blue : palette.text2,
                background: isActive ? palette.blueLight : 'transparent',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                borderRadius: 8,
                marginBottom: 1,
                textDecoration: 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </Box>

        <Box sx={{ p: '14px 16px', borderTop: `1px solid ${palette.divider}`, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: palette.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
            {initials}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nombre || 'Superadmin'}</Box>
            <Box
              onClick={handleLogout}
              sx={{ fontSize: 11, color: palette.text3, cursor: 'pointer', '&:hover': { color: palette.red } }}
            >
              Cerrar sesion
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ ml: '208px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
}

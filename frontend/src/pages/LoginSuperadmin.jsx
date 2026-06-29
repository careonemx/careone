import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Alert, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { palette } from '../theme';

export default function LoginSuperadmin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: palette.bg }}>
      <Paper elevation={0} sx={{ width: 380, p: 4, borderRadius: 3, border: `1px solid ${palette.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Care<Box component="span" sx={{ color: palette.blue }}>One</Box>
          </Box>
          <Box sx={{ fontSize: 13, color: palette.text2, mt: 0.5 }}>Acceso al sistema</Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Contrasena"
            type="password"
            fullWidth
            required
            margin="normal"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2.5, py: 1 }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesion'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import SuperadminLayout from './components/SuperadminLayout';
import ClinicaLayout from './components/ClinicaLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Code-splitting por ruta: cada pagina se carga bajo demanda (reduce el bundle inicial).
import LoginSuperadmin from './pages/LoginSuperadmin'; // login: carga inmediata
const SuperadminClinicas = lazy(() => import('./pages/SuperadminClinicas'));
const SuperadminEspecialidades = lazy(() => import('./pages/SuperadminEspecialidades'));
const ClinicaPersonal = lazy(() => import('./pages/ClinicaPersonal'));
const ClinicaPermisos = lazy(() => import('./pages/ClinicaPermisos'));
const ClinicaConfiguracion = lazy(() => import('./pages/ClinicaConfiguracion'));
const ClinicaPacientes = lazy(() => import('./pages/ClinicaPacientes'));
const ClinicaAgenda = lazy(() => import('./pages/ClinicaAgenda'));
const ClinicaPagos = lazy(() => import('./pages/ClinicaPagos'));
const ClinicaExpediente = lazy(() => import('./pages/ClinicaExpediente'));
const ClinicaInicio = lazy(() => import('./pages/ClinicaInicio'));

const STAFF = ['ADMIN_CLINICA', 'DOCTOR', 'RECEPCIONISTA', 'AYUDANTE'];

const Cargando = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
);

function SuperadminArea({ children }) {
  return (
    <ProtectedRoute roles={['SUPERADMIN']}>
      <SuperadminLayout>{children}</SuperadminLayout>
    </ProtectedRoute>
  );
}

function ClinicaArea({ children, roles = ['ADMIN_CLINICA'] }) {
  return (
    <ProtectedRoute roles={roles}>
      <ClinicaLayout>{children}</ClinicaLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Cargando />}>
    <Routes>
      <Route path="/login" element={<LoginSuperadmin />} />

      {/* Superadmin */}
      <Route path="/superadmin/clinicas" element={<SuperadminArea><SuperadminClinicas /></SuperadminArea>} />
      <Route path="/superadmin/especialidades" element={<SuperadminArea><SuperadminEspecialidades /></SuperadminArea>} />
      <Route path="/superadmin" element={<Navigate to="/superadmin/clinicas" replace />} />

      {/* ADMIN_CLINICA - gestion interna */}
      <Route path="/clinica/personal" element={<ClinicaArea><ClinicaPersonal /></ClinicaArea>} />
      <Route path="/clinica/permisos" element={<ClinicaArea><ClinicaPermisos /></ClinicaArea>} />
      <Route path="/clinica/configuracion" element={<ClinicaArea><ClinicaConfiguracion /></ClinicaArea>} />

      {/* Operacion de la clinica (todo el personal) */}
      <Route path="/clinica/inicio" element={<ClinicaArea roles={STAFF}><ClinicaInicio /></ClinicaArea>} />
      <Route path="/clinica/agenda" element={<ClinicaArea roles={STAFF}><ClinicaAgenda /></ClinicaArea>} />
      <Route path="/clinica/pacientes" element={<ClinicaArea roles={STAFF}><ClinicaPacientes /></ClinicaArea>} />
      <Route path="/clinica/pagos" element={<ClinicaArea roles={['ADMIN_CLINICA', 'DOCTOR', 'RECEPCIONISTA']}><ClinicaPagos /></ClinicaArea>} />
      <Route path="/clinica/expediente/:id" element={<ClinicaArea roles={STAFF}><ClinicaExpediente /></ClinicaArea>} />

      <Route path="/clinica" element={<Navigate to="/clinica/inicio" replace />} />

      <Route path="/proximamente" element={
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ fontSize: 22, fontWeight: 700 }}>Proximamente</Box>
          <Box sx={{ color: '#6B7280' }}>Tu area de trabajo estara disponible en una fase siguiente.</Box>
        </Box>
      } />

      <Route path="/no-autorizado" element={
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ fontSize: 22, fontWeight: 700 }}>No autorizado</Box>
          <Box sx={{ color: '#6B7280' }}>No tienes permiso para ver esta pagina.</Box>
        </Box>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </Suspense>
  );
}

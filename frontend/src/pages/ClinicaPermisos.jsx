import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox,
  CircularProgress, Alert, Paper, Tooltip,
} from '@mui/material';
import permisoService from '../services/permisoService';
import { useNotify } from '../context/NotificationContext';
import { palette } from '../theme';

export default function ClinicaPermisos() {
  const qc = useQueryClient();
  const notify = useNotify();
  const matrizQuery = useQuery({ queryKey: ['permisos', 'matriz'], queryFn: () => permisoService.obtenerMatriz() });

  const cambiarMutation = useMutation({
    mutationFn: (args) => permisoService.cambiar(args),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['permisos', 'matriz'] }); notify.success('Permiso actualizado.'); },
  });

  const data = matrizQuery.data;
  const celda = (rolId, permisoId) =>
    data?.celdas?.find((c) => c.rolId === rolId && c.permisoId === permisoId);

  return (
    <>
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Permisos</Box>
      </Box>

      <Box sx={{ p: 3.5 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Activa o desactiva permisos por rol para tu clinica. Los cambios sobreescriben la configuracion base del sistema.
        </Alert>
        {matrizQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : matrizQuery.isError ? (
          <Alert severity="error">No se pudo cargar la matriz de permisos.</Alert>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Permiso</TableCell>
                  {data.roles.map((r) => (
                    <TableCell key={r.id} align="center" sx={{ fontWeight: 700 }}>{r.nombre}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.permisos.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box sx={{ fontWeight: 600, fontSize: 13 }}>{p.codigo}</Box>
                      <Box sx={{ fontSize: 11, color: palette.text2 }}>{p.descripcion}</Box>
                    </TableCell>
                    {data.roles.map((r) => {
                      const c = celda(r.id, p.id);
                      return (
                        <TableCell key={r.id} align="center">
                          <Tooltip title={c?.esOverride ? 'Personalizado por tu clinica' : 'Valor base del sistema'}>
                            <Checkbox
                              size="small"
                              checked={!!c?.permitido}
                              onChange={(e) => cambiarMutation.mutate({ rolId: r.id, permisoId: p.id, permitido: e.target.checked })}
                              sx={c?.esOverride ? { color: palette.blue } : undefined}
                            />
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </>
  );
}

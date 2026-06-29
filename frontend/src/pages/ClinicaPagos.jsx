import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Autocomplete, CircularProgress, Alert, Paper, Grid,
} from '@mui/material';
import pacienteService from '../services/pacienteService';
import pagoService, { tratamientoService } from '../services/pagoService';
import { palette } from '../theme';

const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX');

export default function ClinicaPagos() {
  const qc = useQueryClient();
  const [paciente, setPaciente] = useState(null);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [form, setForm] = useState({ monto: '', metodo: 'EFECTIVO', concepto: '', tratamientoId: '' });
  const [error, setError] = useState('');

  const pacientesQuery = useQuery({ queryKey: ['pacientes', ''], queryFn: () => pacienteService.listar({ size: 100 }) });
  const pid = paciente?.id;
  const tratQuery = useQuery({ queryKey: ['tratamientos', pid], queryFn: () => tratamientoService.porPaciente(pid), enabled: !!pid });
  const pagosQuery = useQuery({ queryKey: ['pagos', pid], queryFn: () => pagoService.porPaciente(pid), enabled: !!pid });

  const pagoMutation = useMutation({
    mutationFn: (payload) => pagoService.registrar(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pagos'] }); qc.invalidateQueries({ queryKey: ['tratamientos'] }); setPagoOpen(false); },
    onError: (err) => setError(err?.response?.data?.message || 'No se pudo registrar.'),
  });

  const tratamientos = tratQuery.data || [];
  const pagos = pagosQuery.data || [];
  const totalPlan = tratamientos.reduce((s, t) => s + Number(t.total), 0);
  const totalPagado = tratamientos.reduce((s, t) => s + Number(t.pagado || 0), 0);
  const totalPendiente = totalPlan - totalPagado;

  const handlePago = () => {
    setError('');
    if (!form.monto || Number(form.monto) <= 0) {
      setError('El monto debe ser un numero mayor a cero.');
      return;
    }
    pagoMutation.mutate({
      pacienteId: pid, monto: Number(form.monto), metodo: form.metodo,
      concepto: form.concepto, tratamientoId: form.tratamientoId || null,
    });
  };

  return (
    <>
      <Box sx={{ height: 64, bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', px: 3.5, gap: 2, position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Pagos</Box>
        <Box sx={{ ml: 'auto', width: 280 }}>
          <Autocomplete
            options={pacientesQuery.data?.content || []}
            getOptionLabel={(o) => `${o.nombre} ${o.apellidos || ''}`.trim()}
            value={paciente} onChange={(_, v) => setPaciente(v)}
            renderInput={(params) => <TextField {...params} label="Selecciona un paciente" size="small" />}
          />
        </Box>
        <Button variant="contained" disabled={!pid} onClick={() => { setForm({ monto: '', metodo: 'EFECTIVO', concepto: '', tratamientoId: '' }); setError(''); setPagoOpen(true); }}>
          + Registrar pago
        </Button>
      </Box>

      <Box sx={{ p: 3.5 }}>
        {!pid ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', color: palette.text2, borderRadius: 3 }}>
            Selecciona un paciente para ver sus pagos y saldos.
          </Paper>
        ) : (tratQuery.isLoading || pagosQuery.isLoading) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <>
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <SumCard val={money(totalPlan)} lbl="Total de tratamientos" />
              <SumCard val={money(totalPagado)} lbl="Total pagado" color={palette.green} />
              <SumCard val={money(totalPendiente)} lbl="Saldo pendiente" color={palette.amber} />
            </Grid>

            <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1 }}>Tratamientos</Box>
            {tratamientos.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, mb: 3, textAlign: 'center', color: palette.text2, borderRadius: 3 }}>Sin tratamientos.</Paper>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    <TableCell>Tratamiento</TableCell><TableCell>Sesiones</TableCell>
                    <TableCell align="right">Total</TableCell><TableCell align="right">Pagado</TableCell><TableCell align="right">Pendiente</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {tratamientos.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{t.nombre}</TableCell>
                        <TableCell>{t.sesionesHechas}/{t.sesionesTotal}</TableCell>
                        <TableCell align="right">{money(t.total)}</TableCell>
                        <TableCell align="right" sx={{ color: palette.green }}>{money(t.pagado)}</TableCell>
                        <TableCell align="right" sx={{ color: palette.amber }}>{money(t.pendiente)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}

            <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1 }}>Historial de pagos</Box>
            {pagos.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: palette.text2, borderRadius: 3 }}>Sin pagos registrados.</Paper>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead><TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    <TableCell>Fecha</TableCell><TableCell>Concepto</TableCell>
                    <TableCell align="right">Monto</TableCell><TableCell>Metodo</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {pagos.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell sx={{ color: palette.text2 }}>{p.fecha}</TableCell>
                        <TableCell>{p.concepto || '—'}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>{money(p.monto)}</TableCell>
                        <TableCell><Chip label={p.metodo} size="small" sx={{ bgcolor: palette.divider }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </>
        )}
      </Box>

      <Dialog open={pagoOpen} onClose={() => setPagoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar pago</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField label="Monto" type="number" fullWidth required margin="dense" size="small"
            value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
          <TextField label="Metodo" select fullWidth margin="dense" size="small"
            value={form.metodo} onChange={(e) => setForm({ ...form, metodo: e.target.value })}>
            <MenuItem value="EFECTIVO">Efectivo</MenuItem>
            <MenuItem value="TARJETA">Tarjeta</MenuItem>
            <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
          </TextField>
          <TextField label="Tratamiento (opcional)" select fullWidth margin="dense" size="small"
            value={form.tratamientoId} onChange={(e) => setForm({ ...form, tratamientoId: e.target.value })}>
            <MenuItem value="">— Sin asociar —</MenuItem>
            {tratamientos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
          </TextField>
          <TextField label="Concepto" fullWidth margin="dense" size="small"
            value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagoOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handlePago} disabled={pagoMutation.isPending || !form.monto}>
            {pagoMutation.isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function SumCard({ val, lbl, color }) {
  return (
    <Grid item xs={4}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Box sx={{ fontSize: 22, fontWeight: 800, color: color || palette.text }}>{val}</Box>
        <Box sx={{ fontSize: 11.5, color: palette.text3 }}>{lbl}</Box>
      </Paper>
    </Grid>
  );
}

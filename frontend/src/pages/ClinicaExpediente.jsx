import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Tabs, Tab, CircularProgress, Alert, Paper, Chip, Grid } from '@mui/material';
import pacienteService from '../services/pacienteService';
import pagoService, { tratamientoService } from '../services/pagoService';
import { odontogramaService, citasHistorialService } from '../services/expedienteService';
import historiaService from '../services/historiaService';
import TabHistoria from '../components/expediente/TabHistoria';
import TabHigiene from '../components/expediente/TabHigiene';
import TabConsentimientos from '../components/expediente/TabConsentimientos';
import TabFacturacion from '../components/expediente/TabFacturacion';
import TabComunicacion from '../components/expediente/TabComunicacion';
import { palette } from '../theme';

const money = (n) => '$' + Number(n || 0).toLocaleString('es-MX');
const edad = (fn) => { if (!fn) return '—'; const d = new Date(fn); const e = Math.floor((Date.now() - d) / 31557600000); return `${e} años`; };

const TABS = ['Resumen', 'Salud', 'Historia clinica', 'Higiene', 'Odontograma', 'Tratamientos', 'Citas', 'Consentimientos', 'Documentos', 'Pagos', 'Facturacion', 'Comunicacion'];

export default function ClinicaExpediente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const pacienteQuery = useQuery({ queryKey: ['paciente', id], queryFn: () => pacienteService.obtener(id) });
  const p = pacienteQuery.data;

  if (pacienteQuery.isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (pacienteQuery.isError) return <Box sx={{ p: 4 }}><Alert severity="error">No se pudo cargar el paciente.</Alert></Box>;

  const iniciales = `${p.nombre[0] || ''}${(p.apellidos || '')[0] || ''}`.toUpperCase();

  return (
    <>
      {/* Header del paciente */}
      <Box sx={{ bgcolor: palette.white, borderBottom: `1px solid ${palette.border}`, px: 3.5, pt: 1.5, pb: 0 }}>
        <Box sx={{ fontSize: 12.5, color: palette.text3, mb: 1 }}>
          <span style={{ color: palette.blue, cursor: 'pointer' }} onClick={() => navigate('/clinica/pacientes')}>Pacientes</span> / {p.nombre} {p.apellidos}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pb: 2 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: palette.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{iniciales}</Box>
          <Box>
            <Box sx={{ fontSize: 20, fontWeight: 800 }}>{p.nombre} {p.apellidos}</Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', fontSize: 13, color: palette.text2, flexWrap: 'wrap' }}>
              <span>{edad(p.fechaNacimiento)}</span>
              {p.ocupacion && <><span>·</span><span>{p.ocupacion}</span></>}
              {p.telefono && <><span>·</span><span>{p.telefono}</span></>}
              {p.email && <><span>·</span><span>{p.email}</span></>}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
              {p.tipoSangre && <Chip label={p.tipoSangre} size="small" sx={{ bgcolor: palette.redLight, color: '#B91C1C', fontWeight: 600 }} />}
              {p.sexo && <Chip label={p.sexo} size="small" sx={{ bgcolor: palette.divider }} />}
              {p.alergias && <Chip label="Alerta medica" size="small" sx={{ bgcolor: palette.redLight, color: palette.red, fontWeight: 600 }} />}
            </Box>
          </Box>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {TABS.map((t) => <Tab key={t} label={t} />)}
        </Tabs>
      </Box>

      <Box sx={{ p: 3.5 }}>
        {tab === 0 && <TabResumen p={p} pacienteId={id} />}
        {tab === 1 && <TabSalud p={p} />}
        {tab === 2 && <TabHistoria pacienteId={id} paciente={p} />}
        {tab === 3 && <TabHigiene pacienteId={id} />}
        {tab === 4 && <TabOdontograma pacienteId={id} />}
        {tab === 5 && <TabTratamientos pacienteId={id} />}
        {tab === 6 && <TabCitas pacienteId={id} />}
        {tab === 7 && <TabConsentimientos pacienteId={id} />}
        {tab === 8 && <TabPlaceholder titulo="Documentos" texto="Subida de documentos generales (radiografias, fotos) disponible proximamente." />}
        {tab === 9 && <TabPagos pacienteId={id} />}
        {tab === 10 && <TabFacturacion pacienteId={id} />}
        {tab === 11 && <TabComunicacion />}
      </Box>
    </>
  );
}

function Section({ titulo, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2 }}>
      <Box sx={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: palette.text3, mb: 1.5 }}>{titulo}</Box>
      {children}
    </Paper>
  );
}
function Dato({ k, v }) {
  return (<Grid item xs={6}><Box sx={{ fontSize: 11, color: palette.text3, textTransform: 'uppercase' }}>{k}</Box><Box sx={{ fontSize: 13.5, fontWeight: 500 }}>{v || '—'}</Box></Grid>);
}

function TabResumen({ p, pacienteId }) {
  const rcQuery = useQuery({ queryKey: ['resumen-clinico', pacienteId], queryFn: () => historiaService.resumenClinico(pacienteId) });
  const rc = rcQuery.data;
  return (
    <>
      {/* Completitud + alertas clinicas */}
      {rc && (
        <Section titulo={`Completitud del expediente — ${rc.completitud}%`}>
          <Box sx={{ height: 6, bgcolor: palette.divider, borderRadius: 10, overflow: 'hidden', mb: 1.5 }}>
            <Box sx={{ height: '100%', width: `${rc.completitud}%`, bgcolor: rc.completitud === 100 ? palette.green : palette.blue, borderRadius: 10 }} />
          </Box>
          {rc.pendientes.length > 0 && (
            <Box sx={{ fontSize: 12.5, color: palette.text2 }}>
              Pendiente: {rc.pendientes.map((x, i) => <Chip key={i} label={x} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: palette.amberLight, color: '#92400E' }} />)}
            </Box>
          )}
          {rc.alertas.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: palette.red, mb: 0.75 }}>Alertas clinicas</Box>
              {rc.alertas.map((a, i) => (
                <Box key={i} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mr: 0.75, mb: 0.75, fontSize: 12, fontWeight: 600, color: palette.red, px: 1, py: 0.5, bgcolor: palette.redLight, borderRadius: 1 }}>⚠ {a}</Box>
              ))}
            </Box>
          )}
        </Section>
      )}

      <Section titulo="Informacion del paciente">
        <Grid container spacing={2}>
          <Dato k="Nombre" v={`${p.nombre} ${p.apellidos || ''}`} />
          <Dato k="Edad" v={edad(p.fechaNacimiento)} />
          <Dato k="Telefono" v={p.telefono} />
          <Dato k="Email" v={p.email} />
          <Dato k="Tipo de sangre" v={p.tipoSangre} />
          <Dato k="Ocupacion" v={p.ocupacion} />
          <Grid item xs={12}><Box sx={{ fontSize: 11, color: palette.text3, textTransform: 'uppercase' }}>Alergias / Alertas</Box>
            <Box sx={{ fontSize: 13.5, color: p.alergias ? palette.red : palette.green, fontWeight: 500 }}>{p.alergias || 'Sin alertas medicas'}</Box></Grid>
        </Grid>
      </Section>
    </>
  );
}

function TabSalud({ p }) {
  return (
    <>
      <Section titulo="Datos personales">
        <Grid container spacing={2}>
          <Dato k="Sexo" v={p.sexo} />
          <Dato k="Fecha de nacimiento" v={p.fechaNacimiento} />
          <Dato k="Direccion" v={p.direccion} />
          <Dato k="Notas" v={p.notas} />
        </Grid>
      </Section>
      <Section titulo="Contacto de emergencia">
        <Grid container spacing={2}>
          <Dato k="Nombre" v={p.emergenciaNombre} />
          <Dato k="Parentesco" v={p.emergenciaParentesco} />
          <Dato k="Telefono" v={p.emergenciaTelefono} />
        </Grid>
      </Section>
    </>
  );
}

const ARCADA_SUP = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const ARCADA_INF = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const ESTADO_COLOR = {
  NORMAL: { bg: palette.white, border: palette.border },
  RESTAURADO: { bg: '#EFF6FF', border: '#93C5FD' },
  CARIES: { bg: '#FEF2F2', border: '#FCA5A5' },
  AUSENTE: { bg: '#F9FAFB', border: '#E5E7EB' },
};
const CICLO = ['NORMAL', 'RESTAURADO', 'CARIES', 'AUSENTE'];

function TabOdontograma({ pacienteId }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['odontograma', pacienteId], queryFn: () => odontogramaService.obtener(pacienteId) });
  const guardar = useMutation({
    mutationFn: (payload) => odontogramaService.guardarDiente(pacienteId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['odontograma', pacienteId] }),
  });

  const mapa = {};
  (query.data || []).forEach((d) => { mapa[d.fdi] = d; });
  const estadoDe = (fdi) => mapa[fdi]?.estado || 'NORMAL';
  const ciclar = (fdi) => {
    const actual = estadoDe(fdi);
    const sig = CICLO[(CICLO.indexOf(actual) + 1) % CICLO.length];
    guardar.mutate({ fdi, estado: sig, brackets: mapa[fdi]?.brackets || false });
  };

  const Diente = ({ fdi }) => {
    const est = estadoDe(fdi);
    const col = ESTADO_COLOR[est];
    return (
      <Box onClick={() => ciclar(fdi)} title={`Diente ${fdi} · ${est}`} sx={{
        width: 34, height: 46, border: `1.5px solid ${col.border}`, borderRadius: '6px 6px 4px 4px',
        bgcolor: col.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', opacity: est === 'AUSENTE' ? 0.45 : 1,
      }}>
        <Box sx={{ fontSize: 9, fontWeight: 700, color: palette.text3 }}>{fdi}</Box>
        <Box sx={{ fontSize: 15 }}>🦷</Box>
      </Box>
    );
  };

  if (query.isLoading) return <CircularProgress />;
  return (
    <Section titulo="Odontograma (notacion FDI) — clic en un diente para cambiar su estado">
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>{ARCADA_SUP.map((f) => <Diente key={f} fdi={f} />)}</Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{ARCADA_INF.map((f) => <Diente key={f} fdi={f} />)}</Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', fontSize: 12, color: palette.text2 }}>
        <Leyenda c={ESTADO_COLOR.NORMAL} t="Normal" />
        <Leyenda c={ESTADO_COLOR.RESTAURADO} t="Restauracion" />
        <Leyenda c={ESTADO_COLOR.CARIES} t="Caries" />
        <Leyenda c={ESTADO_COLOR.AUSENTE} t="Ausente" />
      </Box>
    </Section>
  );
}
function Leyenda({ c, t }) {
  return (<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: c.bg, border: `1.5px solid ${c.border}` }} />{t}</Box>);
}

function TabTratamientos({ pacienteId }) {
  const query = useQuery({ queryKey: ['tratamientos', pacienteId], queryFn: () => tratamientoService.porPaciente(pacienteId) });
  if (query.isLoading) return <CircularProgress />;
  const ts = query.data || [];
  if (ts.length === 0) return <TabPlaceholder titulo="Tratamientos" texto="Sin tratamientos registrados." />;
  return ts.map((t) => (
    <Section key={t.id} titulo={t.nombre}>
      <Box sx={{ fontSize: 13, color: palette.text2, mb: 1 }}>Sesiones {t.sesionesHechas}/{t.sesionesTotal} · {t.estado}</Box>
      <Grid container spacing={2}>
        <Dato k="Total" v={money(t.total)} />
        <Dato k="Pagado" v={money(t.pagado)} />
        <Dato k="Pendiente" v={money(t.pendiente)} />
      </Grid>
    </Section>
  ));
}

function TabCitas({ pacienteId }) {
  const query = useQuery({ queryKey: ['citas-historial', pacienteId], queryFn: () => citasHistorialService.porPaciente(pacienteId) });
  if (query.isLoading) return <CircularProgress />;
  const cs = query.data || [];
  if (cs.length === 0) return <TabPlaceholder titulo="Citas" texto="Sin citas registradas." />;
  return (
    <Section titulo="Historial de citas">
      {cs.map((c) => (
        <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${palette.divider}` }}>
          <Box><Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{c.tratamiento}</Box><Box sx={{ fontSize: 12, color: palette.text2 }}>{c.fecha} · {c.horaInicio?.slice(0, 5)} · {c.doctorNombre}</Box></Box>
          <Chip label={c.estado} size="small" sx={{ bgcolor: palette.divider }} />
        </Box>
      ))}
    </Section>
  );
}

function TabPagos({ pacienteId }) {
  const query = useQuery({ queryKey: ['pagos', pacienteId], queryFn: () => pagoService.porPaciente(pacienteId) });
  if (query.isLoading) return <CircularProgress />;
  const ps = query.data || [];
  if (ps.length === 0) return <TabPlaceholder titulo="Pagos" texto="Sin pagos registrados." />;
  return (
    <Section titulo="Pagos">
      {ps.map((p) => (
        <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${palette.divider}` }}>
          <Box><Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{money(p.monto)}</Box><Box sx={{ fontSize: 12, color: palette.text2 }}>{p.fecha} · {p.concepto || '—'}</Box></Box>
          <Chip label={p.metodo} size="small" sx={{ bgcolor: palette.divider }} />
        </Box>
      ))}
    </Section>
  );
}

function TabPlaceholder({ titulo, texto }) {
  return (
    <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', color: palette.text2, borderRadius: 3 }}>
      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{titulo}</Box>{texto}
    </Paper>
  );
}

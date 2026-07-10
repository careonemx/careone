// ============================================================================
// Íconos oficiales de CareOne — Design System v1.1, cap. 12 (CONGELADO).
// Librería: Lucide (exclusivamente). Stroke 2px, monocromo, hereda currentColor.
// Excepciones de marca/dominio (no existen en Lucide): Diente (odontograma),
// WhatsApp, Google, Apple → SVG custom (grid 24, stroke 2).
//
// Uso:  import { Icon } from '../components/Icon';
//       <Icon name="agenda" size={20} />
//       <Icon name="alertaClinica" className="..." />
//
// Un concepto = un ícono en todo el producto (DS regla I3). Si necesitas un
// ícono nuevo, agrégalo aquí (no importes lucide-react suelto en las pantallas).
// ============================================================================
import {
  Home, CalendarDays, Users, User, ClipboardList, Banknote, Receipt, Settings,
  HeartPulse, Folder, FileText, FileSignature, Sparkles, Scan, ChartColumn, StickyNote,
  Search, Filter, Plus, Pencil, Trash2, Check, X, CircleCheck, CalendarClock,
  Printer, Send, Signature, EllipsisVertical, ChevronRight, ChevronLeft, CircleDollarSign,
  Paperclip, Download, ArrowLeft, CircleHelp, CircleCheckBig, Clock, CircleX,
  CalendarX, TriangleAlert, CircleAlert, Info, Mail, Phone, Menu, LogOut, Bell,
  Lock, Eye, EyeOff,
} from 'lucide-react';

// Diente custom (odontograma) — Lucide no tiene diente. Del preview del DS.
function Tooth(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5.4c-1.8-1.7-4.3-2-6.1-1C3.9 5.6 3.4 8.4 4.2 11c.5 1.6.6 3 .7 4.6.1 1.7.3 3.6 1.6 4.3 1.2.6 1.8-.9 2-2.3.2-1.4.4-2.8 1.5-2.8s1.3 1.4 1.5 2.8c.2 1.4.8 2.9 2 2.3 1.3-.7 1.5-2.6 1.6-4.3.1-1.6.2-3 .7-4.6.8-2.6.3-5.4-1.7-6.6-1.8-1-4.3-.7-6.4 1Z" />
    </svg>
  );
}

// Mapa nombre-semántico → componente Lucide. Los nombres siguen el cap. 12 del DS.
const MAP = {
  // ---- Módulos ----
  inicio: Home,
  agenda: CalendarDays,
  pacientes: Users,
  paciente: User,
  tratamientos: ClipboardList,
  pagos: Banknote,
  caja: Banknote,
  facturacion: Receipt,
  configuracion: Settings,
  historiaClinica: HeartPulse,
  odontograma: Tooth,
  documentos: Folder,
  documento: FileText,
  consentimientos: FileSignature,
  higieneBucal: Sparkles,
  radiografias: Scan,
  reportes: ChartColumn,
  notas: StickyNote,
  comunicaciones: Send,
  // ---- Acciones ----
  buscar: Search,
  filtrar: Filter,
  nuevo: Plus,
  agregar: Plus,
  editar: Pencil,
  eliminar: Trash2,
  guardar: Check,
  cancelar: X,
  cerrar: X,
  confirmar: Check,
  reagendar: CalendarClock,
  imprimir: Printer,
  enviar: Send,
  firmaDigital: Signature,
  masAcciones: EllipsisVertical,
  abrir: ChevronRight,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  registrarPago: CircleDollarSign,
  emitirFactura: Receipt,
  adjuntar: Paperclip,
  exportarPdf: Download,
  descargar: Download,
  volver: ArrowLeft,
  ayuda: CircleHelp,
  menu: Menu,
  salir: LogOut,
  notificaciones: Bell,
  // ---- Estados (color solo cuando el ícono ES el indicador) ----
  confirmado: CircleCheck,
  completado: CircleCheckBig,
  pendiente: Clock,
  cancelado: CircleX,
  noAsistio: CalendarX,
  alertaClinica: TriangleAlert,
  alertaAdmin: CircleAlert,
  adeudo: Banknote,
  info: Info,
  sinEvaluar: CircleHelp,
  // ---- Canal / contacto ----
  email: Mail,
  telefono: Phone,
  // ---- Auth / login ----
  contrasena: Lock,
  verPass: Eye,
  ocultarPass: EyeOff,
};

/**
 * Ícono del DS. `name` es una clave semántica de MAP; `size` en px (default 20 = icon/md).
 * Cualquier otra prop (className, style, onClick, aria-label…) se pasa al SVG.
 */
export function Icon({ name, size = 20, ...rest }) {
  const Cmp = MAP[name];
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`[Icon] nombre no mapeado: "${name}"`);
    return null;
  }
  return <Cmp width={size} height={size} {...rest} />;
}

export default Icon;

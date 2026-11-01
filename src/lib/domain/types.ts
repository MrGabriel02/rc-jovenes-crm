// Modelo de dominio de la plataforma RC Jóvenes Barquisimeto.
// Pensado para mapearse 1:1 a colecciones de Firestore más adelante.

export type ID = string;
export type ISODate = string; // "2026-11-01" o "2026-11-01T19:00:00"
export type Moneda = "VES" | "USD";

export type EstadoPersona = "hace_vida" | "de_paso";

export interface Persona {
  id: ID;
  cedula: string | null;
  nombre: string;
  apellido: string;
  sexo: "M" | "F";
  fechaNacimiento: ISODate | null;
  telefono: string | null;
  correo: string | null;
  zona: string | null;
  profesion: string | null;
  contactoEmergencia?: string | null;
  alergias?: string | null; // solo visible para logística de retiros
  etiquetas: string[];
  creadoEn: ISODate;
}

export type TipoActividad =
  | "retiro_apostolado"
  | "retiro_seccion"
  | "hora_eucaristica"
  | "circulo_estudio"
  | "dia_apostolado"
  | "charla_formacion"
  | "vfc"
  | "fin_semana_formadores"
  | "fin_semana_equipo";

export interface Actividad {
  id: ID;
  nombre: string;
  tipo: TipoActividad;
  apostoladoId: ID | null; // null = actividad de la sección (Triduo, EE, hora eucarística…)
  inicio: ISODate;
  fin: ISODate;
  lugar: string | null;
  formularioConectado?: ConectorFormulario | null;
  seguimientoPostRetiro: boolean;
}

export type RolParticipacion = "participante" | "servidor" | "responsable";

export interface Participacion {
  id: ID;
  personaId: ID;
  actividadId: ID;
  rol: RolParticipacion;
  montoInscripcion?: number; // USD
  abonos?: Abono[];
  checkIn?: boolean;
}

export interface Abono {
  fecha: ISODate;
  monto: number;
  moneda: Moneda;
  metodo: MetodoPago;
}

export type MetodoPago = "transferencia" | "pago_movil" | "zelle" | "efectivo";

export interface ConectorFormulario {
  hojaId: string; // id del Google Sheet de respuestas
  cuentaPropietaria: string; // gmail del apostolado
  mapeo: Record<string, CampoEstandar | "extra">; // columna -> campo
  ultimaSincronizacion: ISODate | null;
}

export type CampoEstandar =
  | "cedula" | "nombre" | "apellido" | "nombreCompleto" | "sexo" | "fechaNacimiento"
  | "telefono" | "correo" | "zona" | "profesion" | "contactoEmergencia" | "alergias"
  | "invitadoPor" | "equipoReino";

export interface Apostolado {
  id: ID;
  nombre: string;
  descripcion: string;
  correo: string | null;
  directorId: ID | null;
  economoId: ID | null;
}

export interface Equipo {
  id: ID;
  nombre: string;
  responsableId: ID;
  miembros: ID[];
  activo: boolean;
}

export interface Encuentro {
  id: ID;
  equipoId: ID;
  fecha: ISODate;
  programado: boolean; // false = espontáneo, creado al pasar lista
  asistentes: ID[];
}

export interface DirectorEspiritual {
  id: ID;
  nombre: string;
  tipo: "laico" | "sacerdote";
  correoCalendario: string;
  tituloAgenda: string; // título de la Agenda de citas de Google Calendar
  enlaceAgenda: string;
}

export type EstadoDE = "agendada" | "realizada" | "no_realizada" | "sin_confirmar";

export interface SesionDE {
  id: ID;
  personaId: ID;
  directorId: ID;
  inicio: ISODate;
  estado: EstadoDE;
  origen: "agenda_citas" | "manual";
}

export interface MovimientoEconomico {
  id: ID;
  fecha: ISODate;
  tipo: "ingreso" | "gasto";
  categoria: string;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  tasaBCV: number; // Bs por USD del día del movimiento
  metodo: MetodoPago;
  custodio: string; // cuenta o persona que tiene el dinero
  areaId: ID; // apostolado, "seccion" o "casa"
  actividadId: ID | null;
  comprobanteUrl?: string | null; // Google Drive
}

export type TipoEspacio = "salon_comun" | "conferencias" | "auditorio" | "terraza" | "capilla" | "cafetin";

export interface Espacio {
  id: ID;
  nombre: string;
  tipo: TipoEspacio;
  capacidad: number | null;
}

export type TipoSolicitante = "apostolado" | "otra_seccion" | "externo";
export type EstadoReserva = "pendiente" | "aprobada" | "rechazada";

export interface Reserva {
  id: ID;
  espacioId: ID;
  inicio: ISODate;
  bloques: number; // bloques de 1,5 h
  solicitante: string;
  tipoSolicitante: TipoSolicitante;
  responsable: string;
  telefono: string;
  motivo: string;
  aprobaciones: ID[]; // ids de directores de sección que aprobaron
  rechazadaPor?: ID | null;
  recurrente?: "semanal" | null;
  pagado?: boolean;
}

export interface Rol {
  id: ID;
  nombre: string;
  permisos: Partial<Record<Modulo, "leer" | "editar">>;
  alcance: "todo" | "apostolado" | "equipo" | "dirigidos";
}

export type Modulo =
  | "inicio" | "personas" | "calendario" | "seguimiento" | "equipos" | "direccion"
  | "apostolados" | "formacion" | "retiros" | "economia" | "casa"
  | "comunicaciones" | "documentos" | "configuracion";

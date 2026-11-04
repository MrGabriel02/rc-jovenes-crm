/** Datos SIMULADOS de notificaciones y álbumes de fotos. */
export type Canal = "App" | "WhatsApp" | "Correo";
export type Destino = { tipo: "todos" } | { tipo: "rol"; valor: string } | { tipo: "equipo"; valor: string } | { tipo: "apostolado"; valor: string } | { tipo: "personas"; valor: string[] };

export interface Notificacion { id: string; titulo: string; mensaje: string; canales: Canal[]; destino: Destino; destinatarios: number; envio: string; repetir?: "semanal" | "mensual"; leidas?: number }

export const NOTIF_PROGRAMADAS: Notificacion[] = [
  { id: "n1", titulo: "Hora eucarística de la localidad", mensaje: "Este jueves a las 7:30 p. m. en la capilla. ¡Te esperamos!", canales: ["App", "WhatsApp"], destino: { tipo: "todos" }, destinatarios: 160, envio: "2026-11-05T09:00:00" },
  { id: "n2", titulo: "Recordatorio de asistencia", mensaje: "Responsables: pasen la asistencia del encuentro de esta semana.", canales: ["App"], destino: { tipo: "rol", valor: "Responsable de equipo" }, destinatarios: 15, envio: "2026-11-07T18:00:00", repetir: "semanal" },
  { id: "n3", titulo: "Inscripciones de Adviento", mensaje: "Quedan 11 cupos para las Misiones de Adviento. Inscríbete en el enlace.", canales: ["App", "WhatsApp"], destino: { tipo: "apostolado", valor: "Juventud y Familia Misionera" }, destinatarios: 96, envio: "2026-11-10T12:00:00" },
  { id: "n4", titulo: "Informe del mes", mensaje: "Ecónomos: suban los comprobantes de noviembre antes del día 28.", canales: ["Correo"], destino: { tipo: "rol", valor: "Ecónomo de apostolado" }, destinatarios: 9, envio: "2026-11-25T08:00:00", repetir: "mensual" },
];

export const NOTIF_ENVIADAS: Notificacion[] = [
  { id: "e1", titulo: "Misa de Todos los Santos", mensaje: "Hoy a las 6:30 p. m. celebramos a todos los santos.", canales: ["App", "WhatsApp"], destino: { tipo: "todos" }, destinatarios: 160, envio: "2026-11-01T08:00:00", leidas: 131 },
  { id: "e2", titulo: "Bienvenidos del Search XXV", mensaje: "Gracias por vivir el Search. Este es el grupo para seguir en contacto.", canales: ["WhatsApp"], destino: { tipo: "personas", valor: [] }, destinatarios: 31, envio: "2026-10-30T19:00:00", leidas: 29 },
  { id: "e3", titulo: "Equipo San José: cambio de día", mensaje: "Esta semana el encuentro pasa al jueves a la misma hora.", canales: ["App"], destino: { tipo: "equipo", valor: "San José" }, destinatarios: 9, envio: "2026-10-27T10:00:00", leidas: 9 },
  { id: "e4", titulo: "Rosario de la sección", mensaje: "El sábado 7 a las 10:00 a. m. rezamos juntos el rosario.", canales: ["App", "Correo"], destino: { tipo: "todos" }, destinatarios: 160, envio: "2026-10-25T09:00:00", leidas: 96 },
];

export interface Album { id: string; titulo: string; apostolado: string; actividad: string; fecha: string; servicio: "Google Drive" | "Google Fotos"; fotos: number; compartidoCon: boolean; url: string }

export const ALBUMES: Album[] = [
  { id: "a1", titulo: "Search XXV", apostolado: "Search", actividad: "Retiro", fecha: "2026-10-30", servicio: "Google Fotos", fotos: 412, compartidoCon: true, url: "#" },
  { id: "a2", titulo: "God's Plan Retreat 23", apostolado: "God's Plan Retreat", actividad: "Retiro", fecha: "2026-10-25", servicio: "Google Drive", fotos: 287, compartidoCon: true, url: "#" },
  { id: "a3", titulo: "Todos Uno, peregrinación 5", apostolado: "Todos Uno", actividad: "Peregrinación", fecha: "2026-09-13", servicio: "Google Fotos", fotos: 530, compartidoCon: true, url: "#" },
  { id: "a4", titulo: "Mega Misiones 2026", apostolado: "Juventud y Familia Misionera", actividad: "Misiones", fecha: "2026-04-05", servicio: "Google Drive", fotos: 1204, compartidoCon: false, url: "#" },
  { id: "a5", titulo: "Triduo de renovación 2026", apostolado: "General", actividad: "Retiro de la sección", fecha: "2026-07-05", servicio: "Google Fotos", fotos: 198, compartidoCon: true, url: "#" },
  { id: "a6", titulo: "Ejercicios Espirituales 2026", apostolado: "General", actividad: "Retiro de la sección", fecha: "2026-02-15", servicio: "Google Drive", fotos: 96, compartidoCon: false, url: "#" },
  { id: "a7", titulo: "Visita al ancianato", apostolado: "Soñar Despierto", actividad: "Programa VV", fecha: "2026-10-17", servicio: "Google Fotos", fotos: 64, compartidoCon: true, url: "#" },
  { id: "a8", titulo: "Rally Solidaridad 2025", apostolado: "Solidaridad", actividad: "Rally", fecha: "2025-11-30", servicio: "Google Drive", fotos: 340, compartidoCon: true, url: "#" },
  { id: "a9", titulo: "Hora eucarística de octubre", apostolado: "General", actividad: "Hora eucarística", fecha: "2026-10-01", servicio: "Google Fotos", fotos: 37, compartidoCon: true, url: "#" },
];

export const CUENTA_ALBUMES = "rcjovenesbqto@gmail.com";

export const describirDestino = (n: Notificacion) =>
  n.destino.tipo === "todos" ? "Todos" : n.destino.tipo === "personas" ? `${n.destinatarios} personas` : `${({ rol: "Rol", equipo: "Equipo", apostolado: "Apostolado" } as const)[n.destino.tipo]}: ${n.destino.valor}`;
export const fechaHora = (iso: string) => new Date(iso).toLocaleString("es-VE", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

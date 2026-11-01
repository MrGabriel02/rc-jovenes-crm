import { diasEntre, sumarDias, iso } from "./fechas";

/** Secuencia post retiro definida en el documento CRM. El día 0 es el domingo de cierre del retiro. */
export const PASOS_POST_RETIRO = [
  { clave: "grupo", dia: 0, titulo: "Crear grupo de WhatsApp del retiro", canal: "grupo" },
  { clave: "ofrecer_de", dia: 2, titulo: "Ofrecer dirección espiritual", canal: "individual" },
  { clave: "ofrecer_equipo", dia: 4, titulo: "Invitar a un equipo de reino", canal: "individual" },
  { clave: "misa", dia: 7, titulo: "Invitar a misa desde el grupo", canal: "grupo" },
  { clave: "rc_news", dia: 12, titulo: "Compartir RC News", canal: "individual" },
  { clave: "continuidad", dia: 15, titulo: "Preguntar por la continuidad", canal: "individual", soloSiNoRespondio: true },
] as const;

export type ClavePaso = (typeof PASOS_POST_RETIRO)[number]["clave"];
export type EstadoPaso = "pendiente" | "enviado" | "respondio" | "omitido";

export interface SeguimientoPersona {
  personaId: string;
  actividadId: string;
  pasos: Partial<Record<ClavePaso, EstadoPaso>>;
  aceptoDE?: boolean;
  aceptoEquipo?: boolean;
}

export function calendarioPasos(finRetiro: string) {
  return PASOS_POST_RETIRO.map((p) => ({ ...p, fecha: iso(sumarDias(finRetiro, p.dia)) }));
}

/** Pasos que tocan hoy o están atrasados para una persona. */
export function pasosPendientes(seg: SeguimientoPersona, finRetiro: string, hoy: Date) {
  const transcurridos = diasEntre(finRetiro, hoy);
  const respondioAlgo = Object.values(seg.pasos).some((e) => e === "respondio");
  return PASOS_POST_RETIRO.filter((p) => {
    if (p.dia > transcurridos) return false;
    const estado = seg.pasos[p.clave] ?? "pendiente";
    if (estado !== "pendiente") return false;
    if ("soloSiNoRespondio" in p && p.soloSiNoRespondio && respondioAlgo) return false;
    return true;
  }).map((p) => ({ ...p, atrasoDias: transcurridos - p.dia }));
}

/** Paso actual (el último cuya fecha ya llegó) para mostrar "en qué paso va cada persona". */
export function pasoActual(finRetiro: string, hoy: Date) {
  const t = diasEntre(finRetiro, hoy);
  const llegados = PASOS_POST_RETIRO.filter((p) => p.dia <= t);
  return llegados.length ? llegados[llegados.length - 1] : null;
}

export function seguimientoTerminado(finRetiro: string, hoy: Date) {
  return diasEntre(finRetiro, hoy) > 15;
}

export const PLANTILLAS_WHATSAPP: Record<ClavePaso, (nombre: string, extra?: string) => string> = {
  grupo: () => "",
  ofrecer_de: (n, enlace) =>
    `¡Hola ${n}! Fue una alegría tenerte en el retiro. Si quieres seguir creciendo, puedes agendar una dirección espiritual aquí: ${enlace ?? "[enlace]"}`,
  ofrecer_equipo: (n) =>
    `¡Hola ${n}! ¿Te gustaría formar parte de un equipo de reino? Nos reunimos cada semana para leer el Evangelio y compartir. Respóndeme y te conecto con uno.`,
  misa: () => "",
  rc_news: (n, enlace) => `¡Hola ${n}! Te comparto RC News para que estés al tanto de lo que viene: ${enlace ?? "[enlace]"}`,
  continuidad: (n) =>
    `¡Hola ${n}! Han pasado unos días desde el retiro. ¿Te gustaría darle continuidad a lo que viviste? Cuéntame qué te ayudaría y lo vemos juntos.`,
};

export function enlaceWhatsApp(telefono: string, texto: string) {
  const num = telefono.replace(/\D/g, "").replace(/^0/, "58");
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}

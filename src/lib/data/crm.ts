/**
 * Respuestas SIMULADAS del formulario CRM (mismas preguntas que la hoja
 * "DATA BASE - CRM RC (Respuestas)"). Ningún dato corresponde a personas reales.
 */
import { personas } from "./semilla";

export interface RespuestaCRM {
  personaId: string;
  respondidoEn: string;
  tieneDE: boolean;
  quiereDE: boolean;
  federacion: "Sí" | "No" | "Me gustaría asociarme";
  enEquipo: boolean;
  quiereEquipo: boolean;
  enApostolado: boolean;
  compromiso: "Ocasional" | "Mensual" | "Semanal" | "Varias veces por semana";
  liderazgo: "Sí" | "No" | "Tal vez";
  infoPor: "WhatsApp" | "Correo" | "Ambos" | "Ninguno";
  dias: string[];
}

function h(s: string, n: number) {
  let x = n * 2654435761;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 2246822519) >>> 0;
  return (x >>> 0) / 4294967296;
}
const de = <T,>(id: string, n: number, xs: readonly T[]) => xs[Math.floor(h(id, n) * xs.length)];

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** Unas 2 de cada 3 personas respondieron el formulario CRM; la mayoría hace casi 2 años. */
export const RESPUESTAS_CRM: RespuestaCRM[] = personas
  .filter((p) => h(p.id, 1) < 0.68)
  .map((p) => ({
    personaId: p.id,
    respondidoEn: h(p.id, 2) < 0.75 ? `2024-${String(1 + Math.floor(h(p.id, 3) * 9)).padStart(2, "0")}-15` : `2026-${String(1 + Math.floor(h(p.id, 3) * 9)).padStart(2, "0")}-10`,
    tieneDE: h(p.id, 4) < 0.42,
    quiereDE: h(p.id, 5) < 0.7,
    federacion: de(p.id, 6, ["Sí", "No", "No", "Me gustaría asociarme"] as const),
    enEquipo: h(p.id, 7) < 0.5,
    quiereEquipo: h(p.id, 8) < 0.6,
    enApostolado: h(p.id, 9) < 0.55,
    compromiso: de(p.id, 10, ["Ocasional", "Mensual", "Mensual", "Semanal", "Semanal", "Varias veces por semana"] as const),
    liderazgo: de(p.id, 11, ["Sí", "No", "Tal vez", "Tal vez"] as const),
    infoPor: de(p.id, 12, ["WhatsApp", "WhatsApp", "WhatsApp", "Ambos", "Correo", "Ninguno"] as const),
    dias: DIAS.filter((_, i) => h(p.id, 20 + i) < 0.35),
  }));

/** Formularios sincronizados con la base general (simulados). */
export const FORMULARIOS_SINCRONIZADOS = [
  { nombre: "Formulario CRM (base general)", apostolado: "Sección", respuestas: RESPUESTAS_CRM.length, ultima: "2026-10-30" },
  { nombre: "God's Plan Retreat 23", apostolado: "God's Plan Retreat", respuestas: 48, ultima: "2026-11-01" },
  { nombre: "Search XXV", apostolado: "Search", respuestas: 39, ultima: "2026-11-01" },
  { nombre: "Mega Misiones 2026", apostolado: "Juventud y Familia Misionera", respuestas: 130, ultima: "2026-04-01" },
  { nombre: "Todos Uno, peregrinación 5", apostolado: "Todos Uno", respuestas: 36, ultima: "2026-09-10" },
  { nombre: "Triduo de renovación 2026", apostolado: "Sección", respuestas: 51, ultima: "2026-07-01" },
  { nombre: "Ejercicios Espirituales 2026", apostolado: "Sección", respuestas: 46, ultima: "2026-02-10" },
  { nombre: "Misiones de Adviento 2026", apostolado: "Juventud y Familia Misionera", respuestas: 29, ultima: "2026-10-31" },
];

/** Distribución de una respuesta: [{ etiqueta, n }] en el orden dado. */
export function distribucion<T extends string>(valores: T[], orden: readonly T[]) {
  return orden.map((etiqueta) => ({ etiqueta, n: valores.filter((v) => v === etiqueta).length }));
}

/** Miembros de ICAFE (simulados): cuentan como formadores junto a responsables y directores. */
export const ICAFE_IDS = ["p150", "p152", "p154", "p156", "p158"];

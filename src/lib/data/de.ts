/**
 * Agenda SIMULADA de direcciones espirituales y diálogos apostólicos de la semana, leída de la
 * Agenda de citas de Google Calendar de cada director. Usa su propio hash para no mover la semilla.
 */
import { directores, personas, sesionesDE } from "./semilla";

export type Modalidad = "Dirección espiritual" | "Diálogo apostólico";

export interface Acompanante { id: string; nombre: string; tipo: "laico" | "sacerdote"; modalidades: Modalidad[]; calendarioConectado: boolean; enlaceAgenda: string; telefono: string }

export const ACOMPANANTES: Acompanante[] = [
  ...directores.map((d, i) => ({ id: d.id, nombre: d.nombre, tipo: d.tipo, modalidades: ["Dirección espiritual", ...(i === 1 ? (["Diálogo apostólico"] as Modalidad[]) : [])] as Modalidad[], calendarioConectado: true, enlaceAgenda: d.enlaceAgenda, telefono: `0414-000-20${i + 1}0` })),
  { id: "da1", nombre: "Coordinadora de diálogo apostólico", tipo: "laico", modalidades: ["Diálogo apostólico"], calendarioConectado: true, enlaceAgenda: "https://calendar.app.google/dialogo-apostolico", telefono: "0414-000-2040" },
];

const h = (s: string) => {
  let x = 2166136261;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
};

export interface CitaAgenda { id: string; acompananteId: string; personaId: string; persona: string; inicio: string; minutos: number; modalidad: Modalidad; estado: "agendada" | "realizada" | "no_realizada" | "sin_marcar" }

/** Citas del lunes 2 al sábado 7 de noviembre de 2026 (más las del domingo 1, que ya pasaron sin marcar). */
export const AGENDA_SEMANA: CitaAgenda[] = ACOMPANANTES.flatMap((a, ai) => {
  const citas: CitaAgenda[] = [];
  for (let d = 1; d <= 7; d++) {
    const n = Math.floor(h(`${a.id}-${d}`) * 3);
    for (let k = 0; k < n; k++) {
      const p = personas[Math.floor(h(`${a.id}-${d}-${k}`) * 120)];
      const hora = 15 + k + (ai % 2);
      const modalidad = a.modalidades[(d + k) % a.modalidades.length];
      citas.push({
        id: `${a.id}-${d}-${k}`, acompananteId: a.id, personaId: p.id, persona: `${p.nombre} ${p.apellido.split(" ")[0]}`,
        inicio: `2026-11-${String(d).padStart(2, "0")}T${String(hora).padStart(2, "0")}:${k % 2 ? "30" : "00"}:00`, minutos: modalidad === "Diálogo apostólico" ? 30 : 45, modalidad,
        estado: d === 1 ? "sin_marcar" : "agendada",
      });
    }
  }
  return citas;
}).sort((a, b) => a.inicio.localeCompare(b.inicio));

/** Jóvenes que atiende cada director (con DE en los últimos 6 meses). */
export function dirigidosPor(directorId: string) {
  const ids = new Map<string, string>();
  for (const s of sesionesDE) if (s.directorId === directorId && s.estado === "realizada" && s.inicio >= "2026-05-01") ids.set(s.personaId, s.inicio > (ids.get(s.personaId) ?? "") ? s.inicio : ids.get(s.personaId)!);
  return [...ids.entries()].map(([id, ultima]) => {
    const p = personas.find((x) => x.id === id)!;
    return { id, nombre: `${p.nombre} ${p.apellido}`, ultima, sesiones: sesionesDE.filter((s) => s.personaId === id && s.directorId === directorId && s.estado === "realizada").length };
  }).sort((a, b) => b.ultima.localeCompare(a.ultima));
}

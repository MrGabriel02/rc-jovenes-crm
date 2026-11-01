import type { Encuentro } from "./types";

/** Faltas consecutivas más recientes de una persona en los encuentros de su equipo (solo cuentan encuentros). */
export function faltasSeguidas(personaId: string, encuentros: Encuentro[], desde?: string): number {
  const ordenados = [...encuentros]
    .filter((e) => !desde || e.fecha >= desde)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  let n = 0;
  for (const e of ordenados) {
    if (e.asistentes.includes(personaId)) break;
    n++;
  }
  return n;
}

export type NivelAlertaFaltas = null | "responsable" | "crecimiento";

/** 2 faltas seguidas: avisa al responsable. 4: avisa al encargado de crecimiento (y al CRM). */
export function nivelAlertaFaltas(faltas: number): NivelAlertaFaltas {
  if (faltas >= 4) return "crecimiento";
  if (faltas >= 2) return "responsable";
  return null;
}

export function porcentajeAsistencia(personaIds: string[], encuentros: Encuentro[]): number {
  if (!encuentros.length || !personaIds.length) return 0;
  const posibles = encuentros.length * personaIds.length;
  const presentes = encuentros.reduce((s, e) => s + e.asistentes.filter((a) => personaIds.includes(a)).length, 0);
  return Math.round((presentes / posibles) * 100);
}

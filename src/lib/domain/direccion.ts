import type { SesionDE } from "./types";
import { mesesEntre } from "./fechas";

/** Horas que tiene el director para confirmar si la DE se realizó antes de marcarla "sin confirmar". */
export const HORAS_PARA_CONFIRMAR = 48;

export function estadoEfectivo(s: SesionDE, ahora: Date): SesionDE["estado"] {
  if (s.estado !== "agendada") return s.estado;
  const limite = new Date(s.inicio).getTime() + HORAS_PARA_CONFIRMAR * 3_600_000;
  return ahora.getTime() > limite ? "sin_confirmar" : "agendada";
}

/** Solo cuentan las DE que el director confirmó como realizadas. */
export function realizadas(sesiones: SesionDE[]) {
  return sesiones.filter((s) => s.estado === "realizada");
}

export function ultimaDE(personaId: string, sesiones: SesionDE[]): SesionDE | null {
  const r = realizadas(sesiones)
    .filter((s) => s.personaId === personaId)
    .sort((a, b) => b.inicio.localeCompare(a.inicio));
  return r[0] ?? null;
}

export type NivelAlertaDE = null | "director" | "crecimiento";

/** 2 meses sin DE: avisa al director. 3 meses: avisa al encargado del CRM / crecimiento. */
export function nivelAlertaDE(personaId: string, sesiones: SesionDE[], hoy: Date): NivelAlertaDE {
  const u = ultimaDE(personaId, sesiones);
  if (!u) return null; // quien nunca ha tenido DE se trabaja desde seguimiento, no como alerta
  const m = mesesEntre(u.inicio, hoy);
  if (m >= 3) return "crecimiento";
  if (m >= 2) return "director";
  return null;
}

/** Pendientes de confirmar por el director: citas pasadas aún en "agendada". */
export function porConfirmar(sesiones: SesionDE[], ahora: Date) {
  return sesiones.filter((s) => s.estado === "agendada" && new Date(s.inicio) < ahora);
}

/** % de personas con al menos una DE realizada en los últimos `dias` días. */
export function cobertura(personaIds: string[], sesiones: SesionDE[], hoy: Date, dias = 60): number {
  if (!personaIds.length) return 0;
  const corte = hoy.getTime() - dias * 86_400_000;
  const con = new Set(
    realizadas(sesiones)
      .filter((s) => new Date(s.inicio).getTime() >= corte && new Date(s.inicio) <= hoy)
      .map((s) => s.personaId),
  );
  return Math.round((personaIds.filter((p) => con.has(p)).length / personaIds.length) * 100);
}

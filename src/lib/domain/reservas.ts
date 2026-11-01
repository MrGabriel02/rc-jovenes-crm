import type { Reserva, TipoEspacio, TipoSolicitante } from "./types";

export const MINUTOS_BLOQUE = 90;

/** Tarifas por bloque de 1,5 h (USD). Los apostolados de la sección no pagan. */
export const TARIFAS: Record<TipoEspacio, number> = {
  salon_comun: 5,
  conferencias: 10,
  auditorio: 25,
  terraza: 20,
  capilla: 0,
  cafetin: 0,
};

export const COWORKING = { mensual: 50, horario: "Lunes a viernes, 7:00 a.m. a 6:00 p.m." };

export function precioReserva(tipo: TipoEspacio, bloques: number, solicitante: TipoSolicitante) {
  if (solicitante === "apostolado") return 0;
  return TARIFAS[tipo] * bloques;
}

export function finReserva(r: Pick<Reserva, "inicio" | "bloques">) {
  return new Date(new Date(r.inicio).getTime() + r.bloques * MINUTOS_BLOQUE * 60_000);
}

export function seSolapan(a: Pick<Reserva, "inicio" | "bloques" | "espacioId">, b: Pick<Reserva, "inicio" | "bloques" | "espacioId">) {
  if (a.espacioId !== b.espacioId) return false;
  const ai = new Date(a.inicio).getTime();
  const bi = new Date(b.inicio).getTime();
  return ai < finReserva(b).getTime() && bi < finReserva(a).getTime();
}

/** Aprobada cuando la aprobaron todos los directores de sección requeridos (hoy, los dos). */
export function estadoReserva(r: Reserva, directoresRequeridos: string[]) {
  if (r.rechazadaPor) return "rechazada" as const;
  return directoresRequeridos.every((d) => r.aprobaciones.includes(d)) ? ("aprobada" as const) : ("pendiente" as const);
}

export function conflictos(nueva: Reserva, existentes: Reserva[], directores: string[]) {
  return existentes.filter((r) => r.id !== nueva.id && estadoReserva(r, directores) !== "rechazada" && seSolapan(nueva, r));
}

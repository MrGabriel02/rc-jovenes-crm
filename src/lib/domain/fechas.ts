const DIA_MS = 86_400_000;

/** Fecha "de hoy" de la plataforma. En la demo es fija para que los datos simulados sean coherentes. */
export const HOY = new Date("2026-11-01T09:00:00");

export function soloFecha(d: Date | string): Date {
  const x = typeof d === "string" ? new Date(d.length === 10 ? `${d}T00:00:00` : d) : new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function sumarDias(d: Date | string, dias: number): Date {
  const x = soloFecha(d);
  x.setDate(x.getDate() + dias);
  return x;
}

export function diasEntre(desde: Date | string, hasta: Date | string): number {
  return Math.round((soloFecha(hasta).getTime() - soloFecha(desde).getTime()) / DIA_MS);
}

/** Meses calendario completos transcurridos (2 meses = misma fecha dos meses después). */
export function mesesEntre(desde: Date | string, hasta: Date | string): number {
  const a = soloFecha(desde);
  const b = soloFecha(hasta);
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return m;
}

export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const fmtLargo = new Intl.DateTimeFormat("es-VE", { weekday: "long", day: "numeric", month: "long" });
const fmtCorto = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short" });

export const fechaLarga = (d: Date | string) => fmtLargo.format(typeof d === "string" ? new Date(d) : d);
export const fechaCorta = (d: Date | string) => fmtCorto.format(typeof d === "string" ? new Date(d) : d);

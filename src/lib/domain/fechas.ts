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

/** Edad cumplida a la fecha dada. */
export function edad(fechaNacimiento: string, hoy: Date | string = HOY): number {
  const n = soloFecha(fechaNacimiento);
  const h = soloFecha(hoy);
  let e = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e -= 1;
  return e;
}

/** Días que faltan para el próximo cumpleaños (0 = hoy). El 29 de febrero se celebra el 28 en años no bisiestos. */
export function diasParaCumpleanos(fechaNacimiento: string, hoy: Date | string = HOY): number {
  const n = soloFecha(fechaNacimiento);
  const h = soloFecha(hoy);
  const en = (anio: number) => {
    const bisiesto = new Date(anio, 1, 29).getMonth() === 1;
    return new Date(anio, n.getMonth(), n.getMonth() === 1 && n.getDate() === 29 && !bisiesto ? 28 : n.getDate());
  };
  let prox = en(h.getFullYear());
  if (prox < h) prox = en(h.getFullYear() + 1);
  return diasEntre(h, prox);
}

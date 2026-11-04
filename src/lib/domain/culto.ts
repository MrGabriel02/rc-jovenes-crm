/**
 * Horario de misas y adoración en la capilla del Centro Regnum Christi
 * (carrera 5 con calle 3, Urb. Colinas de Santa Rosa, Barquisimeto).
 * Estos horarios bloquean la capilla en las reservas y aparecen en el calendario.
 */
import { iso, soloFecha } from "./fechas";

export type TipoCulto = "Eucaristía" | "Adoración" | "Hora eucarística" | "Hora eucarística de la localidad";

export interface Culto {
  tipo: TipoCulto;
  inicio: string; // "18:30"
  minutos: number;
  lugar: string;
}

export const LUGAR_CASA = "Centro Regnum Christi · carrera 5 con calle 3, Urb. Colinas de Santa Rosa";
const CAPILLA = "Capilla de la casa";

/** Horario semanal fijo (0 = domingo … 6 = sábado). La misa dura unos 45 minutos. */
export const HORARIO_SEMANAL: Record<number, Culto[]> = {
  1: [{ tipo: "Adoración", inicio: "18:00", minutos: 30, lugar: CAPILLA }, { tipo: "Eucaristía", inicio: "18:30", minutos: 45, lugar: CAPILLA }],
  2: [{ tipo: "Adoración", inicio: "18:00", minutos: 30, lugar: CAPILLA }, { tipo: "Eucaristía", inicio: "18:30", minutos: 45, lugar: CAPILLA }],
  3: [{ tipo: "Adoración", inicio: "18:00", minutos: 30, lugar: CAPILLA }, { tipo: "Eucaristía", inicio: "18:30", minutos: 45, lugar: CAPILLA }],
  4: [{ tipo: "Eucaristía", inicio: "18:30", minutos: 45, lugar: CAPILLA }, { tipo: "Hora eucarística", inicio: "19:00", minutos: 60, lugar: CAPILLA }],
  5: [{ tipo: "Eucaristía", inicio: "12:15", minutos: 45, lugar: CAPILLA }],
};

/** Primer jueves del mes: hora eucarística de la localidad, 7:30 a 8:30 p. m. */
export const HORA_EUCARISTICA_LOCALIDAD: Culto = { tipo: "Hora eucarística de la localidad", inicio: "19:30", minutos: 60, lugar: "Localidad Regnum Christi Barquisimeto" };

export const esPrimerJueves = (d: Date | string) => {
  const x = soloFecha(d);
  return x.getDay() === 4 && x.getDate() <= 7;
};

/** Cultos de un día. El primer jueves no hay hora eucarística en la casa porque es la de la localidad. */
export function cultosDelDia(fecha: Date | string): Culto[] {
  const d = soloFecha(fecha);
  const base = HORARIO_SEMANAL[d.getDay()] ?? [];
  if (!esPrimerJueves(d)) return base;
  return [...base.filter((c) => c.tipo !== "Hora eucarística"), HORA_EUCARISTICA_LOCALIDAD];
}

const aMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));

/** Cultos de la capilla que se cruzan con una reserva de la capilla. */
export function choquesConCulto(r: { espacioId: string; inicio: string; minutos: number }): Culto[] {
  if (r.espacioId !== "cap") return [];
  const ini = new Date(r.inicio);
  const desde = ini.getHours() * 60 + ini.getMinutes();
  const hasta = desde + r.minutos;
  return cultosDelDia(iso(ini)).filter((c) => c.lugar === CAPILLA && desde < aMin(c.inicio) + c.minutos && aMin(c.inicio) < hasta);
}

export const horaLegible = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  const pm = hh >= 12;
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${pm ? "p. m." : "a. m."}`;
};

export const finCulto = (c: Culto) => {
  const m = aMin(c.inicio) + c.minutos;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

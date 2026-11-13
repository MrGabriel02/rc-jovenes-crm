/**
 * Historial SIMULADO de los retiros de cada apostolado: ediciones pasadas y próximas, ciudad,
 * participantes, servidores, costo y economía, y retención de quienes participaron.
 */
import { actividades, apostolados, personas } from "./semilla";

const h = (s: string) => {
  let x = 2166136261;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
};
const entre = (s: string, a: number, b: number) => Math.round(a + h(s) * (b - a));

export interface EdicionApostolado {
  id: string; apostoladoId: string; nombre: string; fecha: string; ciudad: string; costoUSD: number;
  participantes: number; servidores: number; ingresosUSD: number; gastosUSD: number;
  retencion: { de: number; equipo: number; otrasActividades: number; asociados: number; siguienteRetiro: number };
  fuenteEconomia: "hoja" | "archivo" | null;
}

const CIUDADES = ["Barquisimeto", "Barquisimeto", "Barquisimeto", "Cabudare", "Carora", "Acarigua", "Barinas"];
const NOMBRE_EDICION: Record<string, (n: number) => string> = {
  gpr: (n) => `God's Plan Retreat ${n}`, search: (n) => `Search ${["XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI"][n - 20] ?? n}`,
  todosuno: (n) => `Todos Uno, peregrinación ${n - 18}`, jfm: (n) => `${n % 2 ? "Misiones de Adviento" : "Mega Misiones"} ${2020 + Math.floor((n - 18) / 2)}`,
  kerigma: (n) => `Kerigma ${n - 15}`, solidaridad: (n) => `Rally Solidaridad ${2019 + (n - 18)}`,
};

export const HISTORIAL: EdicionApostolado[] = apostolados.flatMap((a) => {
  const nombre = NOMBRE_EDICION[a.id] ?? ((n: number) => `${a.nombre} · encuentro ${n - 18}`);
  return [20, 21, 22, 23, 24, 25, 26].map((n, k) => {
    const s = `${a.id}-${n}`;
    const anio = 2023 + Math.floor(k / 2);
    const mes = k % 2 ? 10 : 3;
    const futura = k === 6;
    const participantes = futura ? entre(s + "p", 4, 20) : entre(s + "p", 18, 55);
    const costo = 25 + 5 * Math.floor(k / 2);
    const ingresos = participantes * costo * (0.85 + h(s + "i") * 0.15);
    const real = actividades.find((x) => x.nombre === nombre(n));
    return {
      id: s, apostoladoId: a.id, nombre: nombre(n), fecha: real ? real.inicio.slice(0, 10) : futura ? `2027-0${2 + (k % 3)}-${String(10 + entre(s, 0, 15)).padStart(2, "0")}` : `${anio}-${String(mes).padStart(2, "0")}-${String(entre(s + "d", 5, 26)).padStart(2, "0")}`,
      ciudad: CIUDADES[Math.floor(h(s + "c") * CIUDADES.length)], costoUSD: costo, participantes, servidores: entre(s + "s", 6, 16),
      ingresosUSD: Math.round(ingresos), gastosUSD: futura ? Math.round(ingresos * 0.2) : Math.round(ingresos * (0.65 + h(s + "g") * 0.3)),
      retencion: futura ? { de: 0, equipo: 0, otrasActividades: 0, asociados: 0, siguienteRetiro: 0 } : {
        de: Math.round(participantes * (0.15 + h(s + "de") * 0.3)), equipo: Math.round(participantes * (0.1 + h(s + "eq") * 0.3)),
        otrasActividades: Math.round(participantes * (0.25 + h(s + "ot") * 0.35)), asociados: Math.round(participantes * (0.03 + h(s + "as") * 0.12)),
        siguienteRetiro: Math.round(participantes * (0.08 + h(s + "sr") * 0.2)),
      },
      fuenteEconomia: futura ? null : k < 3 ? "archivo" : "hoja",
    };
  });
});

export const historialDe = (apostoladoId: string) => HISTORIAL.filter((e) => e.apostoladoId === apostoladoId).sort((a, b) => a.fecha.localeCompare(b.fecha));

/** Servidores del apostolado y cuántos retiros ha servido cada uno. */
export function servidoresDe(apostoladoId: string) {
  const i = apostolados.findIndex((a) => a.id === apostoladoId);
  return personas.filter((p) => (Number(p.id.slice(1)) + i * 3) % 11 === 0).slice(0, 12).map((p) => {
    const s = `${apostoladoId}-${p.id}`;
    const retiros = entre(s, 1, 7);
    const ed = historialDe(apostoladoId).filter((e) => e.fecha < "2026-11-01");
    return { personaId: p.id, nombre: `${p.nombre} ${p.apellido}`, retiros, ultimo: ed[ed.length - 1 - (retiros % 2)]?.nombre ?? "", rol: ["Coordinación", "Logística", "Cocina", "Música", "Animación", "Charlas"][Math.floor(h(s + "r") * 6)] };
  }).sort((a, b) => b.retiros - a.retiros);
}

/** Formularios y tablas conectadas de cada apostolado. */
export const formulariosDe = (apostoladoId: string) => historialDe(apostoladoId).slice(-3).map((e) => ({ nombre: `${e.nombre} (respuestas)`, form: "https://docs.google.com/forms/", hoja: "https://docs.google.com/spreadsheets/", fecha: e.fecha }));

const LOGO_COLOR: Record<string, string> = { gpr: "#1f4e79", search: "#c2410c", todosuno: "#0f766e", jfm: "#15803d", sd: "#7c3aed", solidaridad: "#b45309", music: "#be185d", kerigma: "#8a1b24", cruzadas: "#475569", quodagis: "#0e7490" };
export const colorApostolado = (id: string) => LOGO_COLOR[id] ?? "#8a1b24";

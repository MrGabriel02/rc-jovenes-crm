/** Reglas de los equipos de encuentro: eventos, frecuencia de reunión, edad promedio y lista de espera. */
import { diasEntre } from "./fechas";

export const TIPOS_EVENTO = ["Encuentro", "Integración", "Comida", "Fútbol", "Parrilla", "Día de apostolado"] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];

/** Días promedio entre reuniones (null si hay menos de 2). */
export function frecuenciaDias(fechas: string[]): number | null {
  const f = [...fechas].sort();
  if (f.length < 2) return null;
  const total = diasEntre(f[0], f[f.length - 1]);
  return Math.round(total / (f.length - 1));
}

export function describirFrecuencia(dias: number | null) {
  if (dias === null) return "Sin datos";
  if (dias <= 8) return "Semanal";
  if (dias <= 16) return "Cada dos semanas";
  if (dias <= 35) return "Mensual";
  return "Irregular";
}

export function contarEnRango(fechas: string[], desde: string, hasta: string) {
  return fechas.filter((f) => f >= desde && f <= hasta).length;
}

export function edadPromedio(edades: number[]): number | null {
  return edades.length ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length) : null;
}

/**
 * Sugiere equipo para alguien de la lista de espera: primero donde ya tiene conocidos,
 * después el de edad promedio más cercana, y entre esos el que tenga menos integrantes.
 */
export function sugerirEquipo<E extends { id: string; edadPromedio: number | null; integrantes: number; nombresIntegrantes: string[] }>(
  candidato: { edad: number | null; conocidos: string[] }, equipos: E[], maxIntegrantes = 12,
): E | null {
  const conCupo = equipos.filter((e) => e.integrantes < maxIntegrantes);
  if (!conCupo.length) return null;
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const conocido = conCupo.find((e) => candidato.conocidos.some((c) => e.nombresIntegrantes.some((n) => norm(n).includes(norm(c)))));
  if (conocido) return conocido;
  return [...conCupo].sort((a, b) => {
    const da = candidato.edad === null || a.edadPromedio === null ? 0 : Math.abs(a.edadPromedio - candidato.edad);
    const dbb = candidato.edad === null || b.edadPromedio === null ? 0 : Math.abs(b.edadPromedio - candidato.edad);
    return da - dbb || a.integrantes - b.integrantes;
  })[0];
}

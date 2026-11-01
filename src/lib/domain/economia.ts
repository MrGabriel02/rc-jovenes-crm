import type { MovimientoEconomico, Moneda } from "./types";

export const APORTE_LOCALIDAD = 0.1;

export function aUSD(monto: number, moneda: Moneda, tasaBCV: number) {
  return moneda === "USD" ? monto : monto / tasaBCV;
}
export function aBs(monto: number, moneda: Moneda, tasaBCV: number) {
  return moneda === "VES" ? monto : monto * tasaBCV;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export interface Resultado {
  ingresosUSD: number;
  gastosUSD: number;
  ganancia: number;
  aporteLocalidad: number;
  saldoArea: number;
}

/** Estado de resultados de una actividad o área, en USD con la tasa de cada movimiento. El 10 % es sobre la ganancia. */
export function resultado(movs: MovimientoEconomico[]): Resultado {
  let i = 0;
  let g = 0;
  for (const m of movs) {
    const usd = aUSD(m.monto, m.moneda, m.tasaBCV);
    if (m.tipo === "ingreso") i += usd;
    else g += usd;
  }
  const ganancia = i - g;
  const aporte = ganancia > 0 ? ganancia * APORTE_LOCALIDAD : 0;
  return {
    ingresosUSD: r2(i),
    gastosUSD: r2(g),
    ganancia: r2(ganancia),
    aporteLocalidad: r2(aporte),
    saldoArea: r2(ganancia - aporte),
  };
}

export function porCategoria(movs: MovimientoEconomico[], tipo: "ingreso" | "gasto") {
  const acc = new Map<string, number>();
  for (const m of movs.filter((x) => x.tipo === tipo)) {
    acc.set(m.categoria, (acc.get(m.categoria) ?? 0) + aUSD(m.monto, m.moneda, m.tasaBCV));
  }
  return [...acc.entries()].map(([categoria, usd]) => ({ categoria, usd: r2(usd) })).sort((a, b) => b.usd - a.usd);
}

export function saldoPorCustodio(movs: MovimientoEconomico[]) {
  const acc = new Map<string, number>();
  for (const m of movs) {
    const usd = aUSD(m.monto, m.moneda, m.tasaBCV) * (m.tipo === "ingreso" ? 1 : -1);
    acc.set(m.custodio, (acc.get(m.custodio) ?? 0) + usd);
  }
  return [...acc.entries()].map(([custodio, usd]) => ({ custodio, usd: r2(usd) }));
}

/** Deuda de una inscripción después de abonos (en USD). */
export function deudaInscripcion(montoUSD: number, abonos: { monto: number; moneda: Moneda }[], tasaBCV: number) {
  const pagado = abonos.reduce((s, a) => s + aUSD(a.monto, a.moneda, tasaBCV), 0);
  return r2(Math.max(0, montoUSD - pagado));
}

export const usd = (n: number) =>
  new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export const bs = (n: number) =>
  `Bs ${new Intl.NumberFormat("es-VE", { maximumFractionDigits: 2 }).format(n)}`;

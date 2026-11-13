"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, FileDown, FileSpreadsheet } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { descargarDoc } from "@/components/exportar";
import type { MovimientoEconomico } from "@/lib/domain/types";

const usd = (n: number) => `$${Math.round(n).toLocaleString("es-VE")}`;
const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

export interface FilaAporte { apostoladoId: string; apostolado: string; retiros: number; ganancia: number; transferido: boolean }

/** Seguimiento del 10 % de la ganancia que cada apostolado debe pasar a la localidad. */
export function AporteLocalidad({ inicial, anio }: { inicial: FilaAporte[]; anio: number }) {
  const [filas, setFilas] = useState(inicial);
  const aporte = (f: FilaAporte) => Math.max(0, f.ganancia) * 0.1;
  const pendiente = filas.filter((f) => !f.transferido).reduce((s, f) => s + aporte(f), 0);
  const total = filas.reduce((s, f) => s + aporte(f), 0);
  const max = Math.max(...filas.map((f) => Math.abs(f.ganancia)), 1);
  return (
    <Card title={`Aporte del 10 % a la localidad · ${anio}`} subtitle="Sobre la ganancia de los informes entregados. Marca cuando el apostolado hizo la transferencia." action={<Badge tone={pendiente ? "warn" : "good"}>{usd(pendiente)} por transferir</Badge>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Apostolado</th><th className="px-2 py-2 font-semibold">Ganancia informada</th><th className="px-2 py-2 text-right font-semibold">10 %</th><th className="px-2 py-2 font-semibold">Transferencia</th></tr></thead>
          <tbody>
            {[...filas].sort((a, b) => b.ganancia - a.ganancia).map((f) => (
              <tr key={f.apostoladoId} className="border-t border-border">
                <td className="px-2 py-1.5"><strong>{f.apostolado}</strong><span className="block text-xs text-muted">{f.retiros} informe{f.retiros === 1 ? "" : "s"}</span></td>
                <td className="px-2 py-1.5">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-28 overflow-hidden rounded-full bg-surface-2" aria-hidden><span className={`block h-full rounded-full ${f.ganancia >= 0 ? "bg-[var(--series-1)]" : "bg-[var(--warn-ink)]"}`} style={{ width: `${(Math.abs(f.ganancia) / max) * 100}%` }} /></span>
                    <span className={`tabular-nums ${f.ganancia < 0 ? "text-warn-ink" : ""}`}>{usd(f.ganancia)}</span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-semibold tabular-nums">{usd(aporte(f))}</td>
                <td className="px-2 py-1.5">
                  {aporte(f) === 0 ? <span className="text-xs text-muted">No aplica</span> : (
                    <button type="button" aria-pressed={f.transferido} onClick={() => setFilas((l) => l.map((x) => (x.apostoladoId === f.apostoladoId ? { ...x, transferido: !x.transferido } : x)))}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold ${f.transferido ? "border-transparent bg-[color-mix(in_oklab,var(--good-ink)_14%,var(--surface))] text-good-ink" : "border-warn-border bg-warn-bg text-warn-ink"}`}>
                      {f.transferido ? <><Check size={14} aria-hidden />Transferido</> : "Pendiente"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr className="border-t-2 border-border font-bold"><td className="px-2 py-2">Total</td><td className="px-2 py-2 tabular-nums">{usd(filas.reduce((s, f) => s + f.ganancia, 0))}</td><td className="px-2 py-2 text-right tabular-nums">{usd(total)}</td><td className="px-2 py-2 text-xs font-semibold text-muted">{usd(total - pendiente)} recibido</td></tr></tfoot>
        </table>
      </div>
    </Card>
  );
}

/** Conversor rápido entre bolívares y dólares con la tasa BCV del día (editable). */
export function Conversor({ tasaInicial }: { tasaInicial: number }) {
  const [tasa, setTasa] = useState(tasaInicial);
  const [bs, setBs] = useState("");
  const [d, setD] = useState("");
  const n = (s: string) => Number(s.replace(",", ".")) || 0;
  return (
    <Card title="Conversor Bs ⇄ $" subtitle="Para anotar un pago en la moneda que llegó" action={<ArrowLeftRight size={20} aria-hidden className="text-accent" />}>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 100%), 1fr))" }}>
        <label className="flex flex-col gap-1 text-sm font-semibold">Tasa BCV (Bs por $)<input inputMode="decimal" value={tasa} onChange={(e) => setTasa(n(e.target.value))} className={`${campo} tabular-nums`} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Bolívares<input inputMode="decimal" value={bs} placeholder="0" onChange={(e) => { setBs(e.target.value); setD(tasa ? (n(e.target.value) / tasa).toFixed(2) : ""); }} className={`${campo} tabular-nums`} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Dólares<input inputMode="decimal" value={d} placeholder="0" onChange={(e) => { setD(e.target.value); setBs((n(e.target.value) * tasa).toFixed(2)); }} className={`${campo} tabular-nums`} /></label>
      </div>
      <p className="text-xs text-muted">Con la plataforma conectada, la tasa se toma sola del BCV cada mañana.</p>
    </Card>
  );
}

const csvCelda = (x: string | number) => `"${String(x).replace(/"/g, '""')}"`;

/** Botones del encabezado: exportar los movimientos y generar el informe mensual en Word. */
export function AccionesEconomia({ movimientos, areas, mes }: { movimientos: MovimientoEconomico[]; areas: { id: string; nombre: string }[]; mes: { clave: string; nombre: string } }) {
  const nombre = (id: string) => areas.find((a) => a.id === id)?.nombre ?? id;
  const enUsd = (m: MovimientoEconomico) => (m.moneda === "USD" ? m.monto : m.monto / m.tasaBCV);
  const exportar = () => {
    const head = ["Fecha", "Área", "Tipo", "Categoría", "Moneda", "Monto", "Tasa BCV", "En $", "Método", "Custodio"];
    const filas = [...movimientos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((m) => [m.fecha, nombre(m.areaId), m.tipo, m.categoria, m.moneda, m.monto, m.tasaBCV, enUsd(m).toFixed(2), m.metodo.replace("_", " "), m.custodio]);
    const csv = "﻿" + [head, ...filas].map((f) => f.map(csvCelda).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "Movimientos de economía RC Jóvenes.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const informe = () => {
    const delMes = movimientos.filter((m) => m.fecha.slice(5, 7) === mes.clave);
    const lineas = [`Informe económico de ${mes.nombre} · RC Jóvenes Barquisimeto`];
    let ti = 0, tg = 0;
    for (const a of areas) {
      const xs = delMes.filter((m) => m.areaId === a.id);
      if (!xs.length) continue;
      const i = xs.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + enUsd(m), 0);
      const g = xs.filter((m) => m.tipo === "gasto").reduce((s, m) => s + enUsd(m), 0);
      ti += i; tg += g;
      lineas.push(a.nombre, `- Ingresos: ${usd(i)}`, `- Gastos: ${usd(g)}`, `- Ganancia: ${usd(i - g)} · 10 % para la localidad: ${usd(Math.max(0, i - g) * 0.1)}`);
    }
    lineas.push("Total de la sección", `- Ingresos: ${usd(ti)}`, `- Gastos: ${usd(tg)}`, `- Ganancia: ${usd(ti - tg)} · 10 % para la localidad: ${usd(Math.max(0, ti - tg) * 0.1)}`);
    descargarDoc(`Informe económico ${mes.nombre}`, lineas.join("\n"));
  };
  return (
    <>
      <Button variant="secondary" onClick={exportar}><FileSpreadsheet size={16} aria-hidden />Exportar a Excel</Button>
      <Button onClick={informe}><FileDown size={16} aria-hidden />Informe de {mes.nombre.split(" ")[0]} (Word)</Button>
    </>
  );
}

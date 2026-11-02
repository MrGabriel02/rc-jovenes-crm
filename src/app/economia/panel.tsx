"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge, Card, Grid, Kpi, Table } from "@/components/ui";
import { BarrasHorizontales, IngresosGastos } from "@/components/charts";
import { aUSD, porCategoria, resultado, saldoPorCustodio, usd, bs } from "@/lib/domain/economia";
import type { MovimientoEconomico } from "@/lib/domain/types";

const MESES = [["", "Últimos 6 meses"], ["05", "Mayo"], ["06", "Junio"], ["07", "Julio"], ["08", "Agosto"], ["09", "Septiembre"], ["10", "Octubre"]] as const;

export function PanelEconomia({ movimientos, areas, deudores, totalDeudores }: { movimientos: MovimientoEconomico[]; areas: { id: string; nombre: string }[]; deudores: { id: string; nombre: string; deuda: number; pagado: number }[]; totalDeudores: number }) {
  const params = useSearchParams();
  const [area, setArea] = useState(params.get("area") ?? "");
  const [mes, setMes] = useState("");
  const enArea = useMemo(() => movimientos.filter((m) => !area || m.areaId === area), [movimientos, area]);
  const sel = useMemo(() => enArea.filter((m) => !mes || m.fecha.slice(5, 7) === mes), [enArea, mes]);
  const r = resultado(sel);
  const serie = ["05", "06", "07", "08", "09", "10"].map((m) => {
    const x = resultado(enArea.filter((v) => v.fecha.slice(5, 7) === m));
    return { mes: MESES.find((y) => y[0] === m)![1].slice(0, 3).toLowerCase(), ingresos: Math.round(x.ingresosUSD), gastos: Math.round(x.gastosUSD) };
  });
  const nombre = (id: string) => areas.find((a) => a.id === id)?.nombre ?? id;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Apostolado o área
          <select value={area} onChange={(e) => setArea(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink">
            <option value="">Toda la sección</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Período
          <select value={mes} onChange={(e) => setMes(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink">
            {MESES.map(([v, l]) => <option key={v} value={v}>{l} 2026</option>)}
          </select>
        </label>
      </div>
      <Grid min={190}>
        <Kpi label="Ingresos" value={usd(r.ingresosUSD)} />
        <Kpi label="Gastos" value={usd(r.gastosUSD)} />
        <Kpi label="Ganancia" value={usd(r.ganancia)} tone={r.ganancia >= 0 ? "good" : "warn"} note={r.ganancia >= 0 ? "Se transfiere a la cuenta aparte" : "Pérdida en el período"} />
        <Kpi label="10 % para la localidad" value={usd(r.aporteLocalidad)} note="Sobre la ganancia" />
        <Kpi label="Saldo para el área" value={usd(r.saldoArea)} />
      </Grid>
      <Grid min={360}>
        <Card title="Ingresos y gastos por mes" subtitle={area ? nombre(area) : "Toda la sección"}>
          <IngresosGastos data={serie} />
        </Card>
        <Card title="En qué se gasta" subtitle="Gastos por categoría, en dólares">
          <BarrasHorizontales data={porCategoria(sel, "gasto").map((c) => ({ ...c, usd: Math.round(c.usd) }))} x="categoria" y="usd" nombre="Gasto" sufijo=" $" color="var(--series-1)" />
        </Card>
        <Card title="Dónde está el dinero" subtitle="Saldo por custodio, incluidas cuentas personales">
          <ul className="flex flex-col gap-2 text-sm">
            {saldoPorCustodio(sel).map((c) => <li key={c.custodio} className="flex justify-between border-b border-border pb-2 last:border-0"><span>{c.custodio}</span><strong className={c.usd < 0 ? "text-warn-ink" : ""}>{usd(c.usd)}</strong></li>)}
          </ul>
        </Card>
        <Card title="Abonos pendientes" subtitle={`Misiones de Adviento 2026 · ${totalDeudores} con saldo`}>
          <ul className="flex flex-col gap-2 text-sm">
            {deudores.map((d) => <li key={d.id} className="flex justify-between gap-2"><span>{d.nombre}</span><span><span className="text-muted">pagó {usd(d.pagado)} · </span><strong className="text-warn-ink">debe {usd(d.deuda)}</strong></span></li>)}
          </ul>
        </Card>
      </Grid>
      <Card title="Movimientos" subtitle={`${sel.length} movimientos`}>
        <Table head={["Fecha", "Área", "Tipo", "Categoría", "Monto original", "En $", "Método", "Custodio"]} minWidth={900}>
          {[...sel].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 25).map((m) => (
            <tr key={m.id}>
              <td className="tabular-nums">{new Date(`${m.fecha}T12:00:00`).toLocaleDateString("es-VE")}</td>
              <td>{nombre(m.areaId)}</td>
              <td><Badge tone={m.tipo === "ingreso" ? "good" : "warn"}>{m.tipo === "ingreso" ? "Ingreso" : "Gasto"}</Badge></td>
              <td>{m.categoria}</td>
              <td className="tabular-nums">{m.moneda === "USD" ? usd(m.monto) : bs(m.monto)}</td>
              <td className="tabular-nums">{usd(aUSD(m.monto, m.moneda, m.tasaBCV))}</td>
              <td className="capitalize">{m.metodo.replace("_", " ")}</td>
              <td>{m.custodio}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

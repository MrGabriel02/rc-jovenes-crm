"use client";

import { useMemo, useState } from "react";
import { Link2, Trophy, Upload } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { Columnas } from "@/components/charts";

export interface FilaEco { id: string; nombre: string; fecha: string; ciudad: string; costoUSD: number; participantes: number; ingresosUSD: number; gastosUSD: number; fuente: "hoja" | "archivo" | null }

const usd = (n: number) => `$${Math.round(n).toLocaleString("es-VE")}`;
const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

/** Economía por retiro: uno o varios, por fechas, con comparación de ganancias y datos que ayudan a planificar. */
export function EconomiaPorRetiro({ filas }: { filas: FilaEco[] }) {
  const pasadas = filas.filter((f) => f.fuente);
  const [desde, setDesde] = useState(pasadas[0]?.fecha.slice(0, 7) ?? "2023-01");
  const [hasta, setHasta] = useState("2026-12");
  const [elegidos, setElegidos] = useState<string[]>(pasadas.slice(-3).map((f) => f.id));
  const [fuentes, setFuentes] = useState<Record<string, string>>({});
  const enRango = pasadas.filter((f) => f.fecha.slice(0, 7) >= desde && f.fecha.slice(0, 7) <= hasta);
  const sel = enRango.filter((f) => elegidos.includes(f.id));
  const tot = useMemo(() => sel.reduce((a, f) => ({ ing: a.ing + f.ingresosUSD, gas: a.gas + f.gastosUSD, par: a.par + f.participantes }), { ing: 0, gas: 0, par: 0 }), [sel]);
  const mejor = [...sel].sort((a, b) => (b.ingresosUSD - b.gastosUSD) - (a.ingresosUSD - a.gastosUSD))[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Desde<input type="month" value={desde} onChange={(e) => setDesde(e.target.value)} className={`${campo} text-ink`} /></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Hasta<input type="month" value={hasta} onChange={(e) => setHasta(e.target.value)} className={`${campo} text-ink`} /></label>
        <Button variant="secondary" onClick={() => setElegidos(enRango.map((f) => f.id))}>Todos en el rango</Button>
      </div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Retiros</legend>
        {enRango.map((f) => (
          <label key={f.id} className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-semibold ${elegidos.includes(f.id) ? "border-brand bg-accent-soft" : "border-border"}`}>
            <input type="checkbox" className="sr-only" checked={elegidos.includes(f.id)} onChange={(e) => setElegidos((x) => (e.target.checked ? [...x, f.id] : x.filter((y) => y !== f.id)))} />{f.nombre}
          </label>
        ))}
      </fieldset>
      <dl className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))" }}>
        {[["Ingresos", usd(tot.ing)], ["Gastos", usd(tot.gas)], ["Ganancia", usd(tot.ing - tot.gas)], ["Margen", tot.ing ? `${Math.round(((tot.ing - tot.gas) / tot.ing) * 100)}%` : "—"], ["Costo real por participante", tot.par ? usd(tot.gas / tot.par) : "—"]].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-surface-2 p-3"><dt className="text-xs font-semibold text-muted">{l}</dt><dd className="text-xl font-extrabold tabular-nums">{v}</dd></div>
        ))}
      </dl>
      {sel.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-extrabold">Ganancia por retiro</h3>
            <Columnas data={sel.map((f) => ({ retiro: f.nombre.split(" ").slice(-2).join(" "), ganancia: f.ingresosUSD - f.gastosUSD }))} x="retiro" y="ganancia" nombre="Ganancia" sufijo=" $" alto={200} />
            {mejor && sel.length > 1 ? <p className="flex items-center gap-2 text-sm"><Trophy size={16} aria-hidden className="text-[var(--gold)]" /><span><strong>{mejor.nombre}</strong> dio más ganancia: {usd(mejor.ingresosUSD - mejor.gastosUSD)}.</span></p> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Retiro</th><th className="px-2 py-2 text-right font-semibold">Costo</th><th className="px-2 py-2 text-right font-semibold">Ganancia</th><th className="px-2 py-2 text-right font-semibold">Mínimo para no perder</th><th className="px-2 py-2 font-semibold">Datos</th></tr></thead>
              <tbody>
                {sel.map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-2 py-1.5"><span className="flex flex-col"><strong>{f.nombre}</strong><span className="text-xs text-muted">{f.ciudad} · {f.participantes} participantes</span></span></td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{usd(f.costoUSD)}</td>
                    <td className={`px-2 py-1.5 text-right font-bold tabular-nums ${f.ingresosUSD - f.gastosUSD >= 0 ? "text-good-ink" : "text-warn-ink"}`}>{usd(f.ingresosUSD - f.gastosUSD)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{Math.ceil(f.gastosUSD / f.costoUSD)} inscritos</td>
                    <td className="px-2 py-1.5">{fuentes[f.id] ? <Badge tone="good">Conectado</Badge> : <Badge>{f.fuente === "hoja" ? "Hoja conectada" : "Archivo subido"}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : <p className="text-sm text-muted">Elige al menos un retiro.</p>}
      <details className="rounded-xl border border-border">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-semibold">Conectar la economía de un retiro</summary>
        <form className="flex flex-wrap items-end gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setFuentes((x) => ({ ...x, [String(f.get("retiro"))]: String(f.get("url") || "archivo") })); }}>
          <label className="flex flex-col gap-1 text-xs font-semibold">Retiro<select name="retiro" className={campo}>{filas.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">Enlace de la hoja de economía<input name="url" type="url" placeholder="https://docs.google.com/spreadsheets/…" className={campo} /></label>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold"><Upload size={16} aria-hidden />O subir el archivo final<input name="archivo" type="file" accept=".xlsx,.xls,.csv" className="sr-only" /></label>
          <Button type="submit"><Link2 size={16} aria-hidden />Conectar</Button>
        </form>
      </details>
      <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
        <li><strong>Mínimo para no perder:</strong> cuántos inscritos hacen falta para cubrir los gastos con el costo actual.</li>
        <li>Cargar los gastos fijos (casa, transporte) apenas se confirmen permite fijar el costo antes de abrir las inscripciones.</li>
        <li>El informe se cierra a los 7 días del retiro: después de esa fecha queda marcado como pendiente en Economía.</li>
      </ul>
    </div>
  );
}

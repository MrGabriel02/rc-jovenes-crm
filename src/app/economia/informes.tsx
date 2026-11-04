"use client";

import { useState } from "react";
import { Check, FileUp, RefreshCw } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

export interface FilaInforme { id: string; apostoladoId: string; apostolado: string; retiro: string; fecha: string; entregado: string | null; ingresosUSD: number | null; gastosUSD: number | null; hoja: boolean }

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const DIAS_PLAZO = 7;
const sumar = (iso: string, d: number) => { const x = new Date(`${iso}T12:00:00`); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
const corta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "2-digit" });

export function estadoInforme(f: FilaInforme, hoy: string): "entregado" | "pendiente" | "por_vencer" | "no_toca" {
  if (f.entregado) return "entregado";
  if (f.fecha > hoy) return "no_toca";
  return sumar(f.fecha, DIAS_PLAZO) < hoy ? "pendiente" : "por_vencer";
}

/** Informes económicos por apostolado: se marcan al entregarse y pasan a pendientes 7 días después del retiro. */
export function InformesApostolados({ filas: ini, hoy, apostolados }: { filas: FilaInforme[]; hoy: string; apostolados: { id: string; nombre: string }[] }) {
  const [filas, setFilas] = useState(ini);
  const [filtro, setFiltro] = useState<"todos" | "pendiente">("todos");
  const [sync, setSync] = useState(false);
  const est = (f: FilaInforme) => estadoInforme(f, hoy);
  const visibles = filas.filter((f) => est(f) !== "no_toca" && (filtro === "todos" || est(f) === "pendiente")).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const pend = filas.filter((f) => est(f) === "pendiente").length;

  return (
    <>
      <Card title="Informes económicos por apostolado" subtitle={`Pasados ${DIAS_PLAZO} días del retiro sin informe, queda pendiente y se avisa al ecónomo`} action={<Badge tone={pend ? "warn" : "good"}>{pend} pendientes</Badge>}>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(170px, 100%), 1fr))" }}>
          {apostolados.map((a) => {
            const de = filas.filter((f) => f.apostoladoId === a.id && est(f) !== "no_toca");
            const ok = de.filter((f) => est(f) === "entregado").length;
            const p = de.filter((f) => est(f) === "pendiente").length;
            return (
              <div key={a.id} className={`rounded-xl border p-3 text-sm ${p ? "border-warn-border bg-warn-bg" : "border-border bg-surface-2"}`}>
                <strong className="block">{a.nombre}</strong>
                <span className="text-xs text-muted">{ok} de {de.length} entregados</span>
                {p ? <span className="block text-xs font-bold text-warn-ink">{p} pendiente{p > 1 ? "s" : ""}</span> : null}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filtro" className="flex gap-1">
            {(["todos", "pendiente"] as const).map((k) => <button key={k} type="button" aria-pressed={filtro === k} onClick={() => setFiltro(k)} className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${filtro === k ? "border-brand bg-accent-soft" : "border-border"}`}>{k === "todos" ? "Todos" : "Solo pendientes"}</button>)}
          </div>
          <span className="ml-auto"><Button variant="secondary" onClick={() => setSync(true)}><RefreshCw size={16} aria-hidden />{sync ? "Tablas sincronizadas" : "Sincronizar con las tablas"}</Button></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Apostolado</th><th className="px-2 py-2 font-semibold">Retiro</th><th className="px-2 py-2 font-semibold">Fecha</th><th className="px-2 py-2 font-semibold">Vence</th><th className="px-2 py-2 text-right font-semibold">Ganancia</th><th className="px-2 py-2 font-semibold">Estado</th></tr></thead>
            <tbody>
              {visibles.map((f) => {
                const e = est(f);
                return (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-2 py-1.5 font-semibold">{f.apostolado}</td>
                    <td className="px-2 py-1.5">{f.retiro}</td>
                    <td className="px-2 py-1.5">{corta(f.fecha)}</td>
                    <td className="px-2 py-1.5">{corta(sumar(f.fecha, DIAS_PLAZO))}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{f.ingresosUSD !== null && f.gastosUSD !== null ? `$${Math.round(f.ingresosUSD - f.gastosUSD).toLocaleString("es-VE")}` : "—"}</td>
                    <td className="px-2 py-1.5">
                      {e === "entregado" ? <Badge tone="good"><Check size={12} aria-hidden /> Entregado {corta(f.entregado!)}</Badge> : e === "pendiente" ? <Badge tone="warn">Pendiente</Badge> : <Badge tone="accent">En plazo</Badge>}
                      {f.hoja ? <span className="ml-1 text-xs text-muted">· tabla conectada</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Ingresar informe económico" subtitle="Escribe los totales o conecta la tabla del apostolado: el informe queda marcado como entregado">
        <form className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }} onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const id = String(f.get("retiro"));
          setFilas((l) => l.map((x) => (x.id === id ? { ...x, entregado: hoy, ingresosUSD: Number(f.get("ingresos")) || x.ingresosUSD, gastosUSD: Number(f.get("gastos")) || x.gastosUSD, hoja: !!f.get("hoja") || x.hoja } : x)));
          e.currentTarget.reset();
        }}>
          <label className="flex flex-col gap-1 text-sm font-semibold">Retiro
            <select name="retiro" className={campo}>{filas.filter((x) => !x.entregado && est(x) !== "no_toca").map((x) => <option key={x.id} value={x.id}>{x.apostolado} · {x.retiro}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Ingresos ($)<input name="ingresos" type="number" min={0} step="0.01" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Gastos ($)<input name="gastos" type="number" min={0} step="0.01" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Tabla de economía<input name="hoja" type="url" placeholder="https://docs.google.com/spreadsheets/…" className={campo} /></label>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-end rounded-xl border border-border px-3 text-sm font-semibold"><FileUp size={16} aria-hidden />Adjuntar informe (Word o PDF)<input type="file" accept=".doc,.docx,.pdf" className="sr-only" /></label>
          <div className="col-span-full"><Button type="submit">Marcar como entregado</Button></div>
        </form>
      </Card>
    </>
  );
}

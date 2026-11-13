"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown, Download, FileSpreadsheet, FileText, FileUp, Search } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

export type FormatoDoc = "Excel" | "Word" | "PDF";
export interface DocEconomia {
  id: string; apostoladoId: string; retiro: string; archivo: string; formato: FormatoDoc;
  subido: string; subidoPor: string; ingresosUSD: number | null; gastosUSD: number | null; revisado: boolean; url?: string;
}

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const corta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" });
const usd = (n: number) => `$${Math.round(n).toLocaleString("es-VE")}`;
const formatoDe = (nombre: string): FormatoDoc => (/\.xlsx?$|\.csv$/i.test(nombre) ? "Excel" : /\.pdf$/i.test(nombre) ? "PDF" : "Word");

function descargarResumen(d: DocEconomia, apostolado: string) {
  // Documento simulado: se descarga un resumen con los totales del informe.
  const filas = [["Apostolado", apostolado], ["Retiro o actividad", d.retiro], ["Archivo original", d.archivo], ["Subido", d.subido], ["Subido por", d.subidoPor], ["Ingresos ($)", d.ingresosUSD ?? ""], ["Gastos ($)", d.gastosUSD ?? ""], ["Ganancia ($)", d.ingresosUSD !== null && d.gastosUSD !== null ? d.ingresosUSD - d.gastosUSD : ""]];
  const csv = "﻿" + filas.map((f) => f.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = `Resumen - ${d.archivo.replace(/\.[^.]+$/, "")}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Documentos de economía que sube cada apostolado (cada uno lleva sus gastos e ingresos y
 * entrega su tabla y su reporte al final). Se agrupan por apostolado y se marcan al revisarlos.
 */
export function DocumentosEconomia({ inicial, apostolados, hoy }: { inicial: DocEconomia[]; apostolados: { id: string; nombre: string }[]; hoy: string }) {
  const [docs, setDocs] = useState(inicial);
  const [ap, setAp] = useState("");
  const [q, setQ] = useState("");
  const [soloPorRevisar, setSoloPorRevisar] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const filtrados = useMemo(() => docs
    .filter((d) => (!ap || d.apostoladoId === ap) && (!soloPorRevisar || !d.revisado) && (!q || `${d.archivo} ${d.retiro}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.subido.localeCompare(a.subido)), [docs, ap, q, soloPorRevisar]);
  const grupos = apostolados.map((a) => ({ ...a, docs: filtrados.filter((d) => d.apostoladoId === a.id) })).filter((g) => g.docs.length);
  const porRevisar = docs.filter((d) => !d.revisado).length;

  const subir = (form: HTMLFormElement) => {
    const f = new FormData(form);
    const archivos = (f.getAll("archivo") as File[]).filter((x) => x.size || x.name);
    const apId = String(f.get("apostolado"));
    const nuevos: DocEconomia[] = archivos.map((x, i) => ({
      id: `sub-${docs.length + i}`, apostoladoId: apId, retiro: String(f.get("retiro")) || "Sin actividad", archivo: x.name, formato: formatoDe(x.name),
      subido: hoy, subidoPor: "Tú", ingresosUSD: Number(f.get("ingresos")) || null, gastosUSD: Number(f.get("gastos")) || null, revisado: false, url: URL.createObjectURL(x),
    }));
    setDocs((l) => [...nuevos, ...l]);
    setAp(apId);
    setSubiendo(false);
  };

  return (
    <Card id="documentos" title="Documentos de economía por apostolado" subtitle="Cada apostolado lleva sus gastos e ingresos y sube aquí su tabla y su reporte al terminar" action={<Badge tone={porRevisar ? "warn" : "good"}>{porRevisar} por revisar</Badge>}>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Apostolado">
        {[{ id: "", nombre: "Todos" }, ...apostolados].map((a) => {
          const n = a.id ? docs.filter((d) => d.apostoladoId === a.id).length : docs.length;
          return (
            <button key={a.id || "todos"} type="button" aria-pressed={ap === a.id} onClick={() => setAp(a.id)} className={clsx("flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold", ap === a.id ? "border-brand bg-accent-soft text-ink" : "border-border text-ink-2")}>
              {a.nombre}<span className="tabular-nums text-muted">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex min-w-48 flex-1 items-center">
          <Search size={16} aria-hidden className="absolute left-3 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar archivo o retiro" aria-label="Buscar documento" className={`${campo} w-full pl-9`} />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={soloPorRevisar} onChange={(e) => setSoloPorRevisar(e.target.checked)} className="size-5 accent-brand" />Solo por revisar</label>
        <Button onClick={() => setSubiendo((v) => !v)}><FileUp size={16} aria-hidden />Subir documento</Button>
      </div>

      {subiendo ? (
        <form className="grid gap-3 rounded-2xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))" }} onSubmit={(e) => { e.preventDefault(); subir(e.currentTarget); }}>
          <label className="flex flex-col gap-1 text-sm font-semibold">Apostolado
            <select name="apostolado" defaultValue={ap || apostolados[0]?.id} className={campo}>{apostolados.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Retiro o actividad<input name="retiro" required placeholder="Search XXVI" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Ingresos ($, opcional)<input name="ingresos" type="number" min={0} step="0.01" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Gastos ($, opcional)<input name="gastos" type="number" min={0} step="0.01" className={campo} /></label>
          <label className="col-span-full flex flex-col gap-1 text-sm font-semibold">Archivos (Excel, Word o PDF)
            <input name="archivo" type="file" required multiple accept=".xls,.xlsx,.csv,.doc,.docx,.pdf" className="rounded-xl border border-dashed border-border bg-surface p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:font-semibold file:text-white" />
          </label>
          <p className="col-span-full text-xs text-muted">En la demostración el archivo queda solo en este navegador. Con la cuenta conectada se guarda en la carpeta de Drive del apostolado.</p>
          <span className="col-span-full flex gap-2"><Button type="submit">Subir</Button><Button type="button" variant="secondary" onClick={() => setSubiendo(false)}>Cancelar</Button></span>
        </form>
      ) : null}

      <div className="flex flex-col gap-3">
        {grupos.map((g) => {
          const conTotales = g.docs.filter((d) => d.ingresosUSD !== null && d.gastosUSD !== null && d.formato === "Excel");
          const ganancia = conTotales.reduce((s, d) => s + d.ingresosUSD! - d.gastosUSD!, 0);
          return (
            <details key={g.id} open={!!ap || grupos.length <= 3} className="group rounded-2xl border border-border">
              <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 [&::-webkit-details-marker]:hidden">
                <ChevronDown size={16} aria-hidden className="shrink-0 text-muted transition-transform group-open:rotate-180" />
                <strong className="text-sm">{g.nombre}</strong>
                <span className="text-xs text-muted">{g.docs.length} documento{g.docs.length === 1 ? "" : "s"} · último {corta(g.docs[0].subido)}</span>
                {conTotales.length ? <span className="ml-auto text-xs font-semibold tabular-nums">Ganancia informada {usd(ganancia)}</span> : null}
              </summary>
              <ul className="flex flex-col border-t border-border">
                {g.docs.map((d) => {
                  const Icon = d.formato === "Excel" ? FileSpreadsheet : FileText;
                  return (
                    <li key={d.id} className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2.5 last:border-0">
                      <span aria-hidden className={clsx("flex size-9 shrink-0 items-center justify-center rounded-lg", d.formato === "Excel" ? "bg-[color-mix(in_oklab,var(--good-ink)_14%,var(--surface))] text-good-ink" : d.formato === "PDF" ? "bg-warn-bg text-warn-ink" : "bg-accent-soft text-accent")}><Icon size={18} /></span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <strong className="truncate text-sm">{d.archivo}</strong>
                        <span className="text-xs text-muted">{d.retiro} · {corta(d.subido)} · {d.subidoPor}{d.ingresosUSD !== null && d.gastosUSD !== null ? ` · ganancia ${usd(d.ingresosUSD - d.gastosUSD)}` : ""}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        {d.revisado ? <Badge tone="good"><Check size={12} aria-hidden /> Revisado</Badge> : (
                          <button type="button" onClick={() => setDocs((l) => l.map((x) => (x.id === d.id ? { ...x, revisado: true } : x)))} className="min-h-9 rounded-lg border border-border px-2.5 text-xs font-semibold hover:border-brand">Marcar revisado</button>
                        )}
                        {d.url ? (
                          <a href={d.url} download={d.archivo} aria-label={`Descargar ${d.archivo}`} className="flex size-9 items-center justify-center rounded-lg border border-border text-ink hover:border-brand"><Download size={16} /></a>
                        ) : (
                          <button type="button" onClick={() => descargarResumen(d, g.nombre)} aria-label={`Descargar resumen de ${d.archivo}`} title="Descargar resumen" className="flex size-9 items-center justify-center rounded-lg border border-border hover:border-brand"><Download size={16} /></button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
        {!grupos.length ? <p className="text-sm text-muted">No hay documentos con ese filtro.</p> : null}
      </div>
    </Card>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Archive, ArchiveRestore, MessageCircle, Check } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PLANTILLAS_WHATSAPP, enlaceWhatsApp, type ClavePaso, type EstadoPaso, type tasasSeguimiento } from "@/lib/domain/seguimiento";

type Tasas = ReturnType<typeof tasasSeguimiento>;

export interface RetiroSeg {
  id: string; nombre: string; fin: string; pasoActual: string;
  calendario: { clave: string; titulo: string; dia: number; fecha: string }[];
  embudo: { etapa: string; n: number }[];
  tasas: Tasas; terminado: boolean;
  personas: { id: string; nombre: string; primerNombre: string; telefono: string; pasos: Partial<Record<ClavePaso, EstadoPaso>>; pendientes: ClavePaso[] }[];
}

const ETIQUETA: Record<EstadoPaso, string> = { pendiente: "Pendiente", enviado: "Enviado", respondio: "Respondió", omitido: "Omitido" };

/** Tasas de respuesta y rechazo, y una barra por paso con enviados y pendientes. */
export function ResumenTasas({ t }: { t: Tasas }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))" }}>
        {[
          ["Tasa de respuesta", `${t.tasaRespuesta}%`, `${t.respondieron} de ${t.total} respondieron algo`],
          ["Tasa de rechazo", `${t.tasaRechazo}%`, `${t.rechazaron} dijeron que no a DE y a equipo`],
          ["Aceptaron DE", t.aceptaronDE, "Agendaron o pidieron cita"],
          ["Aceptaron equipo", t.aceptaronEquipo, "Pasan a la lista de espera"],
        ].map(([l, v, n]) => (
          <div key={l} className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs font-semibold text-muted">{l}</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{v}</dd>
            <dd className="text-xs text-muted">{n}</dd>
          </div>
        ))}
      </dl>
      <ul className="flex flex-col gap-2" aria-label="Avance por paso">
        {t.pasos.map((p) => {
          const pct = (n: number) => (t.total ? (n / t.total) * 100 : 0);
          return (
            <li key={p.clave} className="grid items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[220px_1fr_150px]">
              <span className="font-semibold"><span className="text-muted">D+{p.dia}</span> {p.titulo}</span>
              <span className="flex h-3 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${p.respondieron} respondieron, ${p.enviados - p.respondieron} enviados sin respuesta, ${p.faltan} sin enviar`}>
                <span style={{ width: `${pct(p.respondieron)}%`, background: "var(--series-1)" }} />
                <span style={{ width: `${pct(p.enviados - p.respondieron)}%`, background: "var(--series-2)" }} className="border-l-2 border-surface" />
                <span style={{ width: `${pct(p.faltan)}%`, background: "var(--warn-border)" }} className="border-l-2 border-surface" />
              </span>
              <span className="text-xs text-muted tabular-nums">{p.llego ? `${p.enviados} enviados · ${p.faltan} faltan` : "Aún no toca"}</span>
            </li>
          );
        })}
      </ul>
      <p className="flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm" style={{ background: "var(--series-1)" }} />Respondieron</span>
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm" style={{ background: "var(--series-2)" }} />Enviado sin respuesta</span>
        <span className="inline-flex items-center gap-1"><span className="size-3 rounded-sm" style={{ background: "var(--warn-border)" }} />Falta enviar</span>
      </p>
    </div>
  );
}

export function TableroSeguimiento({ retiros, cerrados, pasos }: { retiros: RetiroSeg[]; cerrados: RetiroSeg[]; pasos: { clave: ClavePaso; titulo: string; dia: number }[] }) {
  const sp = useSearchParams();
  const [archivados, setArchivados] = useState<string[]>([]);
  const activos = retiros.filter((x) => !archivados.includes(x.id));
  const completados = [...retiros.filter((x) => archivados.includes(x.id)), ...cerrados];
  const [sel, setSel] = useState(sp.get("actividad") ?? retiros[0]?.id);
  const [selCerrado, setSelCerrado] = useState(cerrados[0]?.id);
  const [marcados, setMarcados] = useState<Record<string, EstadoPaso>>({});
  const r = activos.find((x) => x.id === sel) ?? activos[0];
  const c = completados.find((x) => x.id === selCerrado) ?? completados[0];

  const archivo = (
    <Card title="Retiros completados" subtitle="Seguimientos archivados: se consultan aquí sin estorbar los activos">
      <details className="group rounded-xl border border-border">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between px-3 text-sm font-semibold">{completados.length} retiros archivados <span className="text-xs text-muted group-open:hidden">Ver</span></summary>
        {c ? (
          <div className="flex flex-col gap-4 border-t border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label="Retiro archivado" value={c.id} onChange={(e) => setSelCerrado(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm">
                {completados.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
              </select>
              {archivados.includes(c.id) ? <Button variant="secondary" onClick={() => setArchivados((a) => a.filter((x) => x !== c.id))}><ArchiveRestore size={16} aria-hidden />Volver a activos</Button> : null}
            </div>
            <ResumenTasas t={c.tasas} />
          </div>
        ) : null}
      </details>
    </Card>
  );
  if (!r) return archivo;
  const estado = (pid: string, clave: ClavePaso): EstadoPaso => marcados[`${r.id}|${pid}|${clave}`] ?? r.personas.find((p) => p.id === pid)?.pasos[clave] ?? "pendiente";

  return (
    <>
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold" htmlFor="retiro">Retiro</label>
        <select id="retiro" value={r.id} onChange={(e) => setSel(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm">
          {retiros.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>
        <Badge tone="accent">Paso actual: {r.pasoActual}</Badge>
        <span className="ml-auto"><Button variant="secondary" onClick={() => setArchivados((a) => [...a, r.id])}><Archive size={16} aria-hidden />{r.terminado ? "Archivar retiro completado" : "Archivar seguimiento"}</Button></span>
      </div>
      <ResumenTasas t={r.tasas} />
      <ol className="flex flex-wrap gap-2 text-xs">
        {r.calendario.map((c) => <li key={c.clave} className="rounded-lg bg-surface-2 px-2 py-1"><strong>D+{c.dia}</strong> {c.titulo} · {new Date(`${c.fecha}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</li>)}
      </ol>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="px-2 py-2 font-semibold">Joven</th>
              {pasos.map((p) => <th key={p.clave} className="px-2 py-2 font-semibold">D+{p.dia}</th>)}
              <th className="px-2 py-2 font-semibold">Hoy</th>
            </tr>
          </thead>
          <tbody>
            {r.personas.map((p) => {
              const hoy = p.pendientes.find((c) => estado(p.id, c) === "pendiente" && c !== "grupo" && c !== "misa");
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-2 py-2 font-semibold">{p.nombre}</td>
                  {pasos.map((c) => {
                    const e = estado(p.id, c.clave);
                    return <td key={c.clave} className="px-2 py-2"><Badge tone={e === "respondio" ? "good" : e === "enviado" ? "accent" : p.pendientes.includes(c.clave) && e === "pendiente" ? "warn" : "neutral"}>{ETIQUETA[e]}</Badge></td>;
                  })}
                  <td className="px-2 py-2">
                    {hoy ? (
                      <div className="flex gap-1">
                        <a
                          href={enlaceWhatsApp(p.telefono, PLANTILLAS_WHATSAPP[hoy](p.primerNombre))}
                          target="_blank" rel="noreferrer"
                          onClick={() => setMarcados((m) => ({ ...m, [`${r.id}|${p.id}|${hoy}`]: "enviado" }))}
                          className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand px-2.5 text-xs font-bold text-white no-underline"
                        ><MessageCircle size={14} aria-hidden />Enviar</a>
                        <button type="button" aria-label={`Marcar que ${p.primerNombre} respondió`} onClick={() => setMarcados((m) => ({ ...m, [`${r.id}|${p.id}|${hoy}`]: "respondio" }))} className="inline-flex min-h-9 items-center rounded-lg border border-border px-2 text-xs"><Check size={14} aria-hidden /></button>
                      </div>
                    ) : <span className="text-xs text-muted">Al día</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">“Enviar” abre WhatsApp con el mensaje listo. Con la API de WhatsApp activa, el envío será automático desde el número de la sección.</p>
    </Card>
    {archivo}
    </>
  );
}

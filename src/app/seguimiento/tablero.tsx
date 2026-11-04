"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { PLANTILLAS_WHATSAPP, enlaceWhatsApp, type ClavePaso, type EstadoPaso } from "@/lib/domain/seguimiento";

export interface RetiroSeg {
  id: string; nombre: string; fin: string; pasoActual: string;
  calendario: { clave: string; titulo: string; dia: number; fecha: string }[];
  embudo: { etapa: string; n: number }[];
  personas: { id: string; nombre: string; primerNombre: string; telefono: string; pasos: Partial<Record<ClavePaso, EstadoPaso>>; pendientes: ClavePaso[] }[];
}

const ETIQUETA: Record<EstadoPaso, string> = { pendiente: "Pendiente", enviado: "Enviado", respondio: "Respondió", omitido: "Omitido" };

export function TableroSeguimiento({ retiros, pasos }: { retiros: RetiroSeg[]; pasos: { clave: ClavePaso; titulo: string; dia: number }[] }) {
  const sp = useSearchParams();
  const [sel, setSel] = useState(sp.get("actividad") ?? retiros[0]?.id);
  const [marcados, setMarcados] = useState<Record<string, EstadoPaso>>({});
  const r = retiros.find((x) => x.id === sel) ?? retiros[0];
  if (!r) return null;
  const estado = (pid: string, clave: ClavePaso): EstadoPaso => marcados[`${r.id}|${pid}|${clave}`] ?? r.personas.find((p) => p.id === pid)?.pasos[clave] ?? "pendiente";

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold" htmlFor="retiro">Retiro</label>
        <select id="retiro" value={r.id} onChange={(e) => setSel(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm">
          {retiros.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>
        <Badge tone="accent">Paso actual: {r.pasoActual}</Badge>
      </div>
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
  );
}

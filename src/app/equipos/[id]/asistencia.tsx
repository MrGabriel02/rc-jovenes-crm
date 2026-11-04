"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { nivelAlertaFaltas } from "@/lib/domain/asistencia";
import { TIPOS_EVENTO, type TipoEvento } from "@/lib/domain/equipos";

interface Miembro { id: string; nombre: string; faltas: number; tieneDE: boolean; tieneApostolado: boolean; historial: boolean[] }

export function PasarAsistencia({ miembros, fechas }: { miembros: Miembro[]; fechas: string[] }) {
  const [presentes, setPresentes] = useState<Record<string, boolean>>({});
  const [guardado, setGuardado] = useState(false);
  const [tipo, setTipo] = useState<TipoEvento>("Encuentro");
  const [fecha, setFecha] = useState("2026-11-01");
  const n = Object.values(presentes).filter(Boolean).length;

  return (
    <Card title="Crear evento y pasar asistencia" subtitle="Toca a cada integrante para marcarlo presente. Solo los encuentros cuentan para las faltas." action={<Badge tone="accent">{n} de {miembros.length}</Badge>}>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Tipo de evento
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoEvento)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink">
            {TIPOS_EVENTO.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Fecha
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink" />
        </label>
      </div>
      <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
        {miembros.map((m) => {
          const on = !!presentes[m.id];
          const nivel = nivelAlertaFaltas(m.faltas);
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => { setPresentes((p) => ({ ...p, [m.id]: !p[m.id] })); setGuardado(false); }}
                className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm ${on ? "border-brand bg-accent-soft" : "border-border bg-surface"}`}
              >
                <span className="flex flex-col">
                  <strong>{m.nombre}</strong>
                  <span className="text-xs text-muted">{m.tieneDE ? "Con DE" : "Sin DE"} · {m.tieneApostolado ? "Con apostolado" : "Sin apostolado"}</span>
                </span>
                <span className="flex items-center gap-2">
                  {nivel ? <Badge tone="warn">{m.faltas} faltas</Badge> : null}
                  <span aria-hidden className={`flex size-6 items-center justify-center rounded-full border-2 ${on ? "border-brand bg-brand text-white" : "border-border"}`}>{on ? "✓" : ""}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setGuardado(true)}>Guardar {tipo.toLowerCase()}</Button>
        {guardado ? <span className="text-sm text-good-ink" role="status">Guardado (demo: no se envía a ningún servidor).</span> : null}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">Historial de las últimas {fechas.length} semanas</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[640px] text-xs">
            <thead><tr><th className="px-2 py-1 text-left">Integrante</th>{fechas.map((f) => <th key={f} className="px-1 py-1 font-semibold text-muted">{new Date(`${f}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</th>)}</tr></thead>
            <tbody>
              {miembros.map((m) => (
                <tr key={m.id} className="border-t border-border"><td className="px-2 py-1.5">{m.nombre}</td>{m.historial.map((h, i) => <td key={i} className="px-1 text-center">{h ? <span className="text-good-ink">●</span> : <span className="text-warn-ink">○</span>}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">● asistió · ○ faltó</p>
        </div>
      </details>
    </Card>
  );
}

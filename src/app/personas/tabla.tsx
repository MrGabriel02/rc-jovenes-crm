"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";

export interface FilaPersona {
  id: string; nombre: string; cedula: string | null; zona: string | null; estado: "hace_vida" | "de_paso";
  actividades: number; servicios: number; equipo: string | null; ultimaDE: string | null;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function TablaPersonas({ filas }: { filas: FilaPersona[] }) {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | "hace_vida" | "de_paso">("todos");
  const vis = useMemo(() => {
    const n = norm(q);
    return filas.filter((f) => (estado === "todos" || f.estado === estado) && (!n || norm(f.nombre).includes(n) || (f.cedula ?? "").includes(n)));
  }, [filas, q, estado]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex min-h-11 min-w-64 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3">
          <span className="sr-only">Buscar</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o cédula" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <div role="group" aria-label="Filtrar por estado" className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {([["todos", "Todos"], ["hace_vida", "Hacen vida"], ["de_paso", "Han pasado"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={estado === v} onClick={() => setEstado(v)} className={`min-h-9 rounded-lg px-3 text-sm font-semibold ${estado === v ? "bg-surface text-ink shadow-sm" : "text-muted"}`}>{l}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted">{vis.length} personas</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="px-2 py-2 font-semibold">Nombre</th><th className="px-2 py-2 font-semibold">Cédula</th><th className="px-2 py-2 font-semibold">Estado</th>
              <th className="px-2 py-2 font-semibold">Equipo de reino</th><th className="px-2 py-2 text-right font-semibold">Actividades</th><th className="px-2 py-2 text-right font-semibold">Veces que sirvió</th><th className="px-2 py-2 font-semibold">Última DE</th>
            </tr>
          </thead>
          <tbody>
            {vis.slice(0, 60).map((f) => (
              <tr key={f.id} className="border-t border-border">
                <td className="px-2 py-2.5"><Link href={`/personas/${f.id}`} className="font-semibold">{f.nombre}</Link></td>
                <td className="px-2 py-2.5 tabular-nums">{f.cedula ?? <span className="text-warn-ink">Falta</span>}</td>
                <td className="px-2 py-2.5"><Badge tone={f.estado === "hace_vida" ? "good" : "neutral"}>{f.estado === "hace_vida" ? "Hace vida" : "Han pasado"}</Badge></td>
                <td className="px-2 py-2.5">{f.equipo ?? "—"}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{f.actividades}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{f.servicios}</td>
                <td className="px-2 py-2.5">{f.ultimaDE ? new Date(f.ultimaDE).toLocaleDateString("es-VE") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {vis.length > 60 ? <p className="text-xs text-muted">Mostrando 60 de {vis.length}. Afina la búsqueda para ver más.</p> : null}
    </div>
  );
}

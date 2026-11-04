"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

export type Categoria = "actividad" | "reserva" | "culto" | "liturgia";
export interface EventoCal { id: string; fecha: string; hora?: string; titulo: string; categoria: Categoria; tipo: string }

const CATEGORIAS: { id: Categoria; nombre: string; clase: string }[] = [
  { id: "actividad", nombre: "Actividades y encuentros", clase: "bg-accent-soft text-accent" },
  { id: "reserva", nombre: "Reservas de la casa", clase: "bg-[color-mix(in_oklab,var(--series-2)_18%,var(--surface))] text-[var(--series-2)]" },
  { id: "culto", nombre: "Misas y hora eucarística", clase: "bg-[color-mix(in_oklab,var(--gold)_20%,var(--surface))] text-[var(--gold)]" },
  { id: "liturgia", nombre: "Fiestas litúrgicas", clase: "bg-surface-2 text-ink-2 ring-1 ring-border" },
];

export function CalendarioMes({ anio, mes, hoy, eventos, tipos }: { anio: number; mes: number; hoy: string; eventos: EventoCal[]; tipos: string[] }) {
  const [activas, setActivas] = useState<Set<Categoria>>(new Set(["actividad", "reserva", "culto", "liturgia"]));
  const [tipo, setTipo] = useState("todos");
  const primero = new Date(anio, mes, 1);
  const offset = (primero.getDay() + 6) % 7;
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const celdas = Array.from({ length: Math.ceil((offset + diasMes) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= diasMes ? `${anio}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : null;
  });
  const visibles = useMemo(
    () => eventos.filter((e) => activas.has(e.categoria) && (tipo === "todos" || e.categoria !== "actividad" || e.tipo === tipo)),
    [eventos, activas, tipo],
  );
  const alternar = (c: Categoria) => setActivas((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const clase = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)!.clase;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtros del calendario">
        {CATEGORIAS.map((c) => (
          <button key={c.id} type="button" aria-pressed={activas.has(c.id)} onClick={() => alternar(c.id)}
            className={clsx("flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors", activas.has(c.id) ? "border-brand bg-surface text-ink" : "border-border bg-surface-2 text-muted line-through")}>
            <span aria-hidden className={clsx("size-3 rounded-sm", c.clase)} />{c.nombre}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted">Tipo de actividad
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="min-h-10 rounded-lg border border-border bg-surface px-2 text-sm text-ink">
            <option value="todos">Todos</option>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-1 text-xs">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => <div key={d} className="px-1 py-1 font-bold text-muted">{d}</div>)}
          {celdas.map((d, i) => (
            <div key={i} className={clsx("min-h-28 rounded-lg border p-1.5", d ? "border-border bg-surface" : "border-transparent", d === hoy && "ring-2 ring-brand")}>
              {d ? (
                <>
                  <span className="font-bold">{Number(d.slice(8))}</span>
                  <ul className="mt-1 flex flex-col gap-1">
                    {visibles.filter((e) => e.fecha === d).map((e) => (
                      <li key={e.id} className={clsx("truncate rounded px-1 py-0.5 font-semibold", clase(e.categoria))} title={`${e.hora ? `${e.hora} · ` : ""}${e.titulo}`}>
                        {e.hora ? <span className="font-normal tabular-nums">{e.hora} </span> : null}{e.titulo}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

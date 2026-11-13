"use client";

import { Badge } from "@/components/ui";
import { diasEntre, fechaLarga } from "@/lib/domain/fechas";
import { useHoy } from "./hoy";

export interface ItemCuenta { id: string; nombre: string; inicio: string; detalle?: string; etiqueta?: string; sub?: string }

/** Cuenta regresiva contra el día real de hoy (las actividades ya pasadas se ocultan). */
export function CuentaRegresiva({ items, max }: { items: ItemCuenta[]; max?: number }) {
  const { date } = useHoy("2026-11-01T09");
  const lista = items.map((a) => ({ ...a, faltan: diasEntre(date, a.inicio) })).filter((a) => a.faltan >= 0).sort((a, b) => a.faltan - b.faltan).slice(0, max);
  if (!lista.length) return <p className="text-sm text-muted">No hay actividades próximas.</p>;
  return (
    <ul className="flex flex-col">
      {lista.map((a) => (
        <li key={a.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
          <div className="flex w-12 shrink-0 flex-col items-center"><span className="text-2xl font-extrabold text-accent tabular-nums">{a.faltan}</span><span className="text-[11px] text-muted">{a.faltan === 1 ? "día" : "días"}</span></div>
          <div className="flex min-w-0 flex-1 flex-col"><strong className="text-sm">{a.nombre}</strong><span className="text-xs text-muted first-letter:uppercase">{fechaLarga(a.inicio)}{a.detalle ? ` · ${a.detalle}` : ""}</span></div>
          {a.etiqueta ? <div className="hidden shrink-0 flex-col items-end gap-1 min-[420px]:flex"><Badge>{a.etiqueta}</Badge>{a.sub ? <span className="text-[11px] text-muted">{a.sub}</span> : null}</div> : null}
        </li>
      ))}
    </ul>
  );
}

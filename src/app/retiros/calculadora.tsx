"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { listaDeCompras, type Comida } from "@/lib/domain/menu";

export function CalculadoraMenu({ menu }: { menu: Comida[] }) {
  const [asistentes, setAsistentes] = useState(51);
  const [disponible, setDisponible] = useState<Record<string, number>>({});
  const lista = useMemo(() => listaDeCompras(menu, asistentes, disponible), [menu, asistentes, disponible]);

  return (
    <Card title="Menú y lista de compras" subtitle="Recetas por porción: al cambiar los asistentes, la lista se recalcula sola">
      <label className="flex flex-wrap items-center gap-3 text-sm font-semibold">
        Asistentes (incluye servidores)
        <input type="number" min={1} value={asistentes} onChange={(e) => setAsistentes(Math.max(1, Number(e.target.value) || 1))} className="min-h-11 w-28 rounded-xl border border-border bg-surface px-3" />
      </label>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))" }}>
        <ul className="flex flex-col gap-2 text-sm">
          {menu.map((c) => <li key={`${c.dia}-${c.momento}`} className="rounded-xl bg-surface-2 p-3"><strong>{c.dia} · {c.momento}</strong><br /><span className="text-muted">{c.plato}</span></li>)}
        </ul>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead><tr className="text-left text-muted"><th className="py-2 font-semibold">Ingrediente</th><th className="py-2 text-right font-semibold">Necesario</th><th className="py-2 text-right font-semibold">Ya tenemos</th><th className="py-2 text-right font-semibold">Comprar</th></tr></thead>
            <tbody>
              {lista.map((i) => (
                <tr key={i.ingrediente} className="border-t border-border">
                  <td className="py-2">{i.ingrediente}</td>
                  <td className="py-2 text-right tabular-nums">{i.necesario} {i.unidad}</td>
                  <td className="py-2 text-right">
                    <label className="sr-only" htmlFor={`d-${i.ingrediente}`}>Disponible de {i.ingrediente}</label>
                    <input id={`d-${i.ingrediente}`} type="number" min={0} step="0.1" value={disponible[i.ingrediente] ?? 0} onChange={(e) => setDisponible((d) => ({ ...d, [i.ingrediente]: Number(e.target.value) || 0 }))} className="w-20 rounded-lg border border-border bg-surface px-2 py-1 text-right" />
                  </td>
                  <td className={`py-2 text-right font-bold tabular-nums ${i.faltante > 0 ? "text-warn-ink" : "text-good-ink"}`}>{i.faltante} {i.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

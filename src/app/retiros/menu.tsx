"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { BotonesExportar } from "@/components/exportar";
import { CATEGORIAS_ALIMENTO, FACTOR_APETITO, listaDeCompras, porTipoDeAlimento, textoListaCompras, textoMenu, type CategoriaAlimento, type Comida } from "@/lib/domain/menu";

const campo = "min-h-10 rounded-lg border border-border bg-surface px-2 text-sm";

/** Menú editable (platos e ingredientes) y lista de compras por tipo de alimento. */
export function MenuYCompras({ inicial, titulo, inscritos }: { inicial: Comida[]; titulo: string; inscritos: number }) {
  const [menu, setMenu] = useState(inicial);
  const [servidores, setServidores] = useState(8);
  const [factor, setFactor] = useState<number>(FACTOR_APETITO.jovenesHombres);
  const [editando, setEditando] = useState<number | null>(null);
  const [disponible, setDisponible] = useState<Record<string, number>>({});
  const comen = inscritos + servidores;
  const lista = useMemo(() => listaDeCompras(menu, comen, disponible, factor), [menu, comen, disponible, factor]);
  const grupos = porTipoDeAlimento(lista);

  const cambiar = (ci: number, fn: (c: Comida) => Comida) => setMenu((m) => m.map((c, i) => (i === ci ? fn(c) : c)));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Inscritos<input readOnly value={inscritos} className={`${campo} w-24 text-ink`} /></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Servidores y cocina<input type="number" min={0} value={servidores} onChange={(e) => setServidores(Math.max(0, Number(e.target.value) || 0))} className={`${campo} w-24 text-ink`} /></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Cómo comen
          <select value={factor} onChange={(e) => setFactor(Number(e.target.value))} className={`${campo} text-ink`}>
            <option value={FACTOR_APETITO.normal}>Porción normal</option>
            <option value={FACTOR_APETITO.jovenes}>Jóvenes (+30 %)</option>
            <option value={FACTOR_APETITO.jovenesHombres}>Hombres jóvenes (+40 %)</option>
          </select>
        </label>
        <p className="text-sm"><strong className="tabular-nums">{comen}</strong> personas comen, con porciones al {Math.round(factor * 100)} %.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-extrabold">Menú</h3><BotonesExportar nombre={`Menú ${titulo}`} texto={() => textoMenu(`Menú ${titulo} (${comen} personas)`, menu, comen, factor)} /></div>
          <ul className="flex flex-col gap-2">
            {menu.map((c, ci) => (
              <li key={`${c.dia}-${c.momento}-${ci}`} className="rounded-xl bg-surface-2 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span><strong>{c.dia} · {c.momento}</strong> <span className="text-muted">{c.plato}</span></span>
                  <button type="button" className="text-xs font-semibold" onClick={() => setEditando(editando === ci ? null : ci)}>{editando === ci ? "Listo" : "Editar"}</button>
                </div>
                {editando === ci ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold">Plato<input value={c.plato} onChange={(e) => cambiar(ci, (x) => ({ ...x, plato: e.target.value }))} className={campo} /></label>
                    <table className="w-full text-xs">
                      <thead><tr className="text-left text-muted"><th className="py-1">Ingrediente</th><th className="py-1">Por persona</th><th className="py-1">Unidad</th><th className="py-1">Tipo</th><th /></tr></thead>
                      <tbody>
                        {c.ingredientes.map((ing, ii) => (
                          <tr key={ii}>
                            <td className="py-1 pr-1"><input aria-label="Ingrediente" value={ing.ingrediente} onChange={(e) => cambiar(ci, (x) => ({ ...x, ingredientes: x.ingredientes.map((y, j) => (j === ii ? { ...y, ingrediente: e.target.value } : y)) }))} className={`${campo} w-full`} /></td>
                            <td className="py-1 pr-1"><input aria-label="Cantidad por persona" type="number" step="0.01" min={0} value={ing.porPersona} onChange={(e) => cambiar(ci, (x) => ({ ...x, ingredientes: x.ingredientes.map((y, j) => (j === ii ? { ...y, porPersona: Number(e.target.value) || 0 } : y)) }))} className={`${campo} w-20`} /></td>
                            <td className="py-1 pr-1"><select aria-label="Unidad" value={ing.unidad} onChange={(e) => cambiar(ci, (x) => ({ ...x, ingredientes: x.ingredientes.map((y, j) => (j === ii ? { ...y, unidad: e.target.value } : y)) }))} className={campo}>{["kg", "und", "l", "paq"].map((u) => <option key={u}>{u}</option>)}</select></td>
                            <td className="py-1 pr-1"><select aria-label="Tipo de alimento" value={ing.categoria ?? "Otros"} onChange={(e) => cambiar(ci, (x) => ({ ...x, ingredientes: x.ingredientes.map((y, j) => (j === ii ? { ...y, categoria: e.target.value as CategoriaAlimento } : y)) }))} className={campo}>{CATEGORIAS_ALIMENTO.map((u) => <option key={u}>{u}</option>)}</select></td>
                            <td><button type="button" aria-label={`Quitar ${ing.ingrediente}`} onClick={() => cambiar(ci, (x) => ({ ...x, ingredientes: x.ingredientes.filter((_, j) => j !== ii) }))} className="p-1 text-muted hover:text-ink"><Trash2 size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <span className="flex gap-2">
                      <Button variant="secondary" onClick={() => cambiar(ci, (x) => ({ ...x, ingredientes: [...x.ingredientes, { ingrediente: "Nuevo ingrediente", unidad: "kg", porPersona: 0.1, categoria: "Otros" }] }))}><Plus size={14} aria-hidden />Ingrediente</Button>
                      <Button variant="secondary" onClick={() => { setMenu((m) => m.filter((_, i) => i !== ci)); setEditando(null); }}><Trash2 size={14} aria-hidden />Quitar comida</Button>
                    </span>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => { setMenu((m) => [...m, { dia: "Domingo", momento: "Merienda", plato: "Nuevo plato", ingredientes: [] }]); setEditando(menu.length); }}><Plus size={16} aria-hidden />Añadir comida</Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-extrabold">Lista de compras por tipo de alimento</h3><BotonesExportar nombre={`Lista de compras ${titulo}`} texto={() => textoListaCompras(`Lista de compras ${titulo} (${comen} personas)`, lista)} /></div>
          {grupos.map((g) => (
            <details key={g.categoria} open className="rounded-xl border border-border">
              <summary className="flex min-h-10 cursor-pointer items-center justify-between px-3 text-sm font-semibold">{g.categoria}<Badge>{g.items.length}</Badge></summary>
              <table className="w-full border-t border-border text-sm">
                <tbody>
                  {g.items.map((i) => (
                    <tr key={i.ingrediente} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5">{i.ingrediente}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-muted">{i.necesario} {i.unidad}</td>
                      <td className="px-3 py-1.5 text-right">
                        <input aria-label={`Ya tenemos de ${i.ingrediente}`} type="number" min={0} step="0.1" value={disponible[i.ingrediente] ?? 0} onChange={(e) => setDisponible((d) => ({ ...d, [i.ingrediente]: Number(e.target.value) || 0 }))} className="w-16 rounded-lg border border-border bg-surface px-1 py-0.5 text-right" />
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold tabular-nums">{i.faltante} {i.unidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          ))}
          <p className="text-xs text-muted">Columnas: necesario, lo que ya tenemos (donado o sobrante) y lo que falta comprar.</p>
        </div>
      </div>
    </div>
  );
}

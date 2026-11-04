"use client";

import { useState } from "react";
import { BarrasLista } from "@/components/ui";

export interface FilaRet { id: string; nombre: string; participantes: number; retencion: { de: number; equipo: number; otrasActividades: number; asociados: number; siguienteRetiro: number } }

/** Qué hicieron después quienes fueron a los retiros del apostolado: en general o por retiro. */
export function Retencion({ filas }: { filas: FilaRet[] }) {
  const [sel, setSel] = useState("general");
  const lista = sel === "general" ? filas : filas.filter((f) => f.id === sel);
  const total = lista.reduce((a, f) => a + f.participantes, 0);
  const suma = (k: keyof FilaRet["retencion"]) => lista.reduce((a, f) => a + f.retencion[k], 0);
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-wrap items-center gap-2 text-sm font-semibold">Ver
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm">
          <option value="general">Todos los retiros ({filas.length})</option>
          {[...filas].reverse().map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}
        </select>
      </label>
      <p className="text-sm text-ink-2">De <strong>{total}</strong> participantes:</p>
      <BarrasLista total={total} datos={[
        { etiqueta: "Fueron a otras actividades", n: suma("otrasActividades") },
        { etiqueta: "Tienen dirección espiritual", n: suma("de") },
        { etiqueta: "Entraron a un equipo de encuentro", n: suma("equipo") },
        { etiqueta: "Volvieron a otro retiro", n: suma("siguienteRetiro") },
        { etiqueta: "Se asociaron al Regnum Christi", n: suma("asociados") },
      ]} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { BellPlus, BellRing, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";

export interface Recordatorio { id: string; titulo: string; fecha: string; hora: string; aviso: "1 día antes" | "2 horas antes" | "30 minutos antes"; repetir: "No se repite" | "Cada semana" | "Cada 15 días" | "Cada mes" }

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

function faltan(fecha: string, hora: string, hoy: Date) {
  const d = Math.round((new Date(`${fecha}T${hora}:00`).getTime() - hoy.getTime()) / 86400000);
  return d <= 0 ? "Hoy" : d === 1 ? "Mañana" : `En ${d} días`;
}

/** Recordatorios de reuniones del apostolado: se programan aquí y llegan como notificación. */
export function Recordatorios({ inicial, hoy }: { inicial: Recordatorio[]; hoy: string }) {
  const [lista, setLista] = useState(inicial);
  const [nuevo, setNuevo] = useState(false);
  const base = new Date(hoy);
  const orden = [...lista].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {orden.map((r, i) => (
          <li key={r.id} className={`flex items-center gap-3 rounded-2xl p-3 ${i === 0 ? "bg-accent-soft" : "bg-surface-2"}`}>
            <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-surface py-1.5 text-center shadow-sm">
              <span className="text-[10px] font-bold uppercase text-brand">{new Date(`${r.fecha}T12:00:00`).toLocaleDateString("es-VE", { month: "short" })}</span>
              <span className="text-xl font-extrabold leading-none tabular-nums">{r.fecha.slice(8)}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <strong className="text-sm">{r.titulo}</strong>
              <span className="text-xs text-muted"><strong className="text-brand sm:hidden">{faltan(r.fecha, r.hora, base)} · </strong>{r.hora} · {r.repetir} · aviso {r.aviso}</span>
            </div>
            <span className="hidden sm:inline-flex"><Badge tone={i === 0 ? "accent" : "neutral"}>{faltan(r.fecha, r.hora, base)}</Badge></span>
            <button type="button" aria-label={`Borrar ${r.titulo}`} onClick={() => setLista((l) => l.filter((x) => x.id !== r.id))} className="rounded-lg p-2 text-muted hover:text-ink"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
      {nuevo ? (
        <form className="grid gap-2 rounded-2xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))" }} onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setLista((l) => [...l, { id: `n${l.length}`, titulo: String(f.get("titulo")), fecha: String(f.get("fecha")), hora: String(f.get("hora")), aviso: f.get("aviso") as Recordatorio["aviso"], repetir: f.get("repetir") as Recordatorio["repetir"] }]);
          setNuevo(false);
        }}>
          <label className="col-span-full flex flex-col gap-1 text-xs font-semibold">Reunión<input name="titulo" required placeholder="Reunión del equipo organizador" className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Fecha<input name="fecha" type="date" required defaultValue="2026-11-10" className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Hora<input name="hora" type="time" required defaultValue="20:00" className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Avisarme<select name="aviso" className={campo}><option>1 día antes</option><option>2 horas antes</option><option>30 minutos antes</option></select></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Repetir<select name="repetir" className={campo}><option>No se repite</option><option>Cada semana</option><option>Cada 15 días</option><option>Cada mes</option></select></label>
          <span className="col-span-full flex gap-2"><Button type="submit"><BellRing size={16} aria-hidden />Programar</Button><Button type="button" variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button></span>
        </form>
      ) : <Button variant="secondary" onClick={() => setNuevo(true)}><BellPlus size={16} aria-hidden />Programar recordatorio</Button>}
    </div>
  );
}

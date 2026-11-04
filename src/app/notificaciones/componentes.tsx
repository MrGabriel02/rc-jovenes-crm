"use client";

import { useState } from "react";
import { BellRing, CalendarClock, Send, X } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { describirDestino, fechaHora, type Canal, type Notificacion } from "@/lib/data/avisos";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const CANALES: Canal[] = ["App", "WhatsApp", "Correo"];
const TIPOS = [["todos", "Todos"], ["rol", "Un rol"], ["equipo", "Un equipo"], ["apostolado", "Un apostolado"], ["personas", "Personas específicas"]] as const;
type TipoDestino = (typeof TIPOS)[number][0];

export function Redactar({ opciones, inicial }: { opciones: { rol: string[]; equipo: string[]; apostolado: string[]; personas: { id: string; nombre: string }[]; total: number; tamanos: Record<string, number> }; inicial: Notificacion[] }) {
  const [programadas, setProgramadas] = useState(inicial);
  const [tipo, setTipo] = useState<TipoDestino>("todos");
  const [valor, setValor] = useState("");
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [canales, setCanales] = useState<Canal[]>(["App"]);
  const [cuando, setCuando] = useState<"ahora" | "programar">("ahora");
  const [aviso, setAviso] = useState<string | null>(null);
  const lista = tipo === "rol" || tipo === "equipo" || tipo === "apostolado" ? opciones[tipo] : [];
  const n = tipo === "todos" ? opciones.total : tipo === "personas" ? elegidas.length : opciones.tamanos[`${tipo}:${valor || lista[0]}`] ?? 0;

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = valor || lista[0];
    const destino = tipo === "todos" ? { tipo } : tipo === "personas" ? { tipo, valor: elegidas } : { tipo, valor: v };
    const nueva: Notificacion = { id: `x${programadas.length}`, titulo: String(f.get("titulo")), mensaje: String(f.get("mensaje")), canales, destino: destino as Notificacion["destino"], destinatarios: n, envio: cuando === "ahora" ? new Date().toISOString() : `${f.get("fecha")}T${f.get("hora")}:00`, repetir: (f.get("repetir") || undefined) as Notificacion["repetir"] };
    if (cuando === "programar") setProgramadas((p) => [...p, nueva].sort((a, b) => a.envio.localeCompare(b.envio)));
    setAviso(cuando === "ahora" ? `Enviada a ${n} personas por ${canales.join(", ")}.` : `Programada para ${fechaHora(nueva.envio)}.`);
    e.currentTarget.reset(); setElegidas([]);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <form onSubmit={enviar} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">Título<input name="titulo" required className={campo} maxLength={60} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Mensaje<textarea name="mensaje" required className={`${campo} min-h-24 py-2`} /></label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Para quién</legend>
          <div className="flex flex-wrap gap-1">
            {TIPOS.map(([k, l]) => <button key={k} type="button" aria-pressed={tipo === k} onClick={() => { setTipo(k); setValor(""); }} className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${tipo === k ? "border-brand bg-accent-soft" : "border-border"}`}>{l}</button>)}
          </div>
          {lista.length ? <select aria-label="Elegir" value={valor || lista[0]} onChange={(e) => setValor(e.target.value)} className={campo}>{lista.map((x) => <option key={x}>{x}</option>)}</select> : null}
          {tipo === "personas" ? (
            <div className="flex flex-col gap-2">
              <select aria-label="Añadir persona" value="" onChange={(e) => e.target.value && setElegidas((xs) => (xs.includes(e.target.value) ? xs : [...xs, e.target.value]))} className={campo}>
                <option value="">Añadir persona…</option>
                {opciones.personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <ul className="flex flex-wrap gap-1">
                {elegidas.map((id) => <li key={id}><button type="button" onClick={() => setElegidas((xs) => xs.filter((x) => x !== id))} className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1 text-xs">{opciones.personas.find((p) => p.id === id)?.nombre}<X size={12} aria-label="Quitar" /></button></li>)}
              </ul>
            </div>
          ) : null}
          <span className="text-xs text-muted">Le llegará a <strong className="text-ink">{n}</strong> personas.</span>
        </fieldset>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-1 text-sm font-semibold">Por dónde</legend>
          {CANALES.map((c) => (
            <label key={c} className="inline-flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={canales.includes(c)} onChange={(e) => setCanales((xs) => (e.target.checked ? [...xs, c] : xs.filter((x) => x !== c)))} className="size-4" />{c === "App" ? "Notificación de la app" : c}
            </label>
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Cuándo</legend>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="cuando" checked={cuando === "ahora"} onChange={() => setCuando("ahora")} className="size-4" />Enviar ahora</label>
            <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="cuando" checked={cuando === "programar"} onChange={() => setCuando("programar")} className="size-4" />Programar</label>
          </div>
          {cuando === "programar" ? (
            <div className="flex flex-wrap gap-2">
              <input name="fecha" type="date" required defaultValue="2026-11-08" aria-label="Fecha" className={campo} />
              <input name="hora" type="time" required defaultValue="09:00" aria-label="Hora" className={campo} />
              <select name="repetir" aria-label="Repetir" className={campo}><option value="">Una sola vez</option><option value="semanal">Cada semana</option><option value="mensual">Cada mes</option></select>
            </div>
          ) : null}
        </fieldset>
        <Button type="submit" disabled={!canales.length || !n}>{cuando === "ahora" ? <><Send size={16} aria-hidden />Enviar</> : <><CalendarClock size={16} aria-hidden />Programar</>}</Button>
        {aviso ? <p role="status" className="rounded-xl bg-good-bg p-3 text-sm text-good-ink">{aviso}</p> : null}
      </form>
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-extrabold"><BellRing size={16} aria-hidden />Programadas</h3>
        <ul className="flex flex-col gap-2">
          {programadas.map((p) => (
            <li key={p.id} className="flex flex-col gap-1 rounded-xl bg-surface-2 p-3 text-sm">
              <span className="flex items-start justify-between gap-2"><strong>{p.titulo}</strong><button type="button" onClick={() => setProgramadas((xs) => xs.filter((x) => x.id !== p.id))} className="text-xs font-semibold text-muted hover:text-ink">Cancelar</button></span>
              <span className="text-xs text-muted">{fechaHora(p.envio)}{p.repetir ? ` · se repite cada ${p.repetir === "semanal" ? "semana" : "mes"}` : ""}</span>
              <span className="flex flex-wrap gap-1">{p.canales.map((c) => <Badge key={c}>{c}</Badge>)}<Badge tone="accent">{describirDestino(p)}</Badge></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ImagePlus, MessageCircle, Plus, Search, Send, UserPlus } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { TipoLugar } from "@/lib/data/promocion";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const TIPOS: TipoLugar[] = ["Colegio", "Parroquia", "Universidad", "Otro"];

export interface FilaLugar { id: string; tipo: TipoLugar; nombre: string; zona: string; contacto: string; embajadores: string[]; ultimaVisita: string | null; jovenes: number; notas?: string }

export function Directorio({ inicial }: { inicial: FilaLugar[] }) {
  const [lugares, setLugares] = useState(inicial);
  const [tipo, setTipo] = useState<TipoLugar | "Todos">("Todos");
  const [q, setQ] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const filtrados = useMemo(() => lugares.filter((l) => (tipo === "Todos" || l.tipo === tipo) && `${l.nombre} ${l.zona}`.toLowerCase().includes(q.toLowerCase())), [lugares, tipo, q]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Tipo" className="flex flex-wrap gap-1">
          {(["Todos", ...TIPOS] as const).map((t) => (
            <button key={t} type="button" aria-pressed={tipo === t} onClick={() => setTipo(t)} className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${tipo === t ? "border-brand bg-accent-soft" : "border-border"}`}>
              {t} {t !== "Todos" ? <span className="text-muted">{lugares.filter((l) => l.tipo === t).length}</span> : null}
            </button>
          ))}
        </div>
        <label className="relative ml-auto">
          <span className="sr-only">Buscar</span>
          <Search size={16} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar lugar o zona" className={`${campo} pl-9`} />
        </label>
        <Button onClick={() => setNuevo((v) => !v)}><Plus size={16} aria-hidden />Añadir lugar</Button>
      </div>
      {nuevo ? (
        <form
          className="grid gap-3 rounded-xl bg-surface-2 p-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setLugares((l) => [{ id: `n${l.length}`, tipo: f.get("tipo") as TipoLugar, nombre: String(f.get("nombre")), zona: String(f.get("zona")), contacto: String(f.get("contacto")), embajadores: [], ultimaVisita: null, jovenes: 0 }, ...l]);
            setNuevo(false);
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-semibold">Tipo<select name="tipo" className={campo} defaultValue="Parroquia">{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Nombre<input name="nombre" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Zona<input name="zona" className={campo} placeholder="Centro, Este…" /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Contacto (cargo)<input name="contacto" className={campo} placeholder="Párroco, coordinación…" /></label>
          <div className="col-span-full flex gap-2"><Button type="submit">Guardar lugar</Button><Button type="button" variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button></div>
        </form>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Lugar</th><th className="px-2 py-2 font-semibold">Zona</th><th className="px-2 py-2 font-semibold">Contacto</th><th className="px-2 py-2 font-semibold">Embajadores</th><th className="px-2 py-2 font-semibold">Última visita</th><th className="px-2 py-2 text-right font-semibold">Jóvenes</th></tr></thead>
          <tbody>
            {filtrados.map((l) => (
              <tr key={l.id} className="border-t border-border align-top">
                <td className="px-2 py-2"><span className="flex flex-col"><strong>{l.nombre}</strong><span className="text-xs text-muted">{l.tipo}{l.notas ? ` · ${l.notas}` : ""}</span></span></td>
                <td className="px-2 py-2">{l.zona}</td>
                <td className="px-2 py-2">{l.contacto}</td>
                <td className="px-2 py-2">{l.embajadores.length ? l.embajadores.join(", ") : <Badge tone="warn">Sin embajador</Badge>}</td>
                <td className="px-2 py-2">{l.ultimaVisita ? new Date(`${l.ultimaVisita}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" }) : <span className="text-muted">Nunca</span>}</td>
                <td className="px-2 py-2 text-right tabular-nums">{l.jovenes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function NuevoEmbajador({ personas, lugares, promociones }: { personas: { id: string; nombre: string }[]; lugares: { id: string; nombre: string }[]; promociones: { id: string; nombre: string }[] }) {
  const [ok, setOk] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setOk(`${personas.find((p) => p.id === f.get("persona"))?.nombre} quedó como embajador en ${lugares.find((l) => l.id === f.get("lugar"))?.nombre}.`);
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-semibold">Persona<select name="persona" className={campo}>{personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Lugar<select name="lugar" className={campo}>{lugares.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Promoción<select name="promo" className={campo}><option value="">Todas (embajador fijo)</option>{promociones.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
      <Button type="submit"><UserPlus size={16} aria-hidden />Añadir embajador</Button>
      {ok ? <p role="status" className="rounded-xl bg-good-bg p-3 text-sm text-good-ink">{ok}</p> : null}
    </form>
  );
}

export function EnviarFlyer({ promociones }: { promociones: { id: string; nombre: string; embajadores: { id: string; nombre: string; telefono: string; lugar: string }[] }[] }) {
  const [pid, setPid] = useState(promociones[0]?.id);
  const [flyer, setFlyer] = useState<string | null>(null);
  const p = promociones.find((x) => x.id === pid) ?? promociones[0];
  const [texto, setTexto] = useState("");
  const mensaje = texto || `¡Hola! Te comparto el flyer de ${p?.nombre}. ¿Me ayudas a difundirlo en tu grupo? Las inscripciones están abiertas en el enlace.`;
  if (!p) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">Promoción
          <select value={p.id} onChange={(e) => setPid(e.target.value)} className={campo}>{promociones.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Flyer
          <span className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:border-brand">
            <ImagePlus size={16} aria-hidden />{flyer ? "Cambiar" : "Subir imagen"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFlyer(URL.createObjectURL(f)); }} />
          </span>
        </label>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local */}
      {flyer ? <img src={flyer} alt="Flyer elegido" className="max-h-48 self-start rounded-xl object-contain" /> : null}
      <label className="flex flex-col gap-1 text-sm font-semibold">Mensaje<textarea value={mensaje} onChange={(e) => setTexto(e.target.value)} className={`${campo} min-h-24 py-2`} /></label>
      <ul className="flex flex-col gap-1">
        {p.embajadores.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-sm last:border-0">
            <span className="flex flex-col"><strong>{e.nombre}</strong><span className="text-xs text-muted">{e.lugar}</span></span>
            <a href={`https://wa.me/${e.telefono.replace(/\D/g, "").replace(/^0/, "58")}?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand px-2.5 text-xs font-bold text-white no-underline"><MessageCircle size={14} aria-hidden />Enviar</a>
          </li>
        ))}
      </ul>
      <Button variant="secondary"><Send size={16} aria-hidden />Enviar a los {p.embajadores.length} embajadores</Button>
      <p className="text-xs text-muted">Sin la API de WhatsApp, cada botón abre el chat con el mensaje listo y el flyer se adjunta a mano. Con la API, se envía todo de una vez.</p>
    </div>
  );
}

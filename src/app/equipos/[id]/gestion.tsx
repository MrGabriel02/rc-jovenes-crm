"use client";

import { useState } from "react";
import { Camera, Plus, UserMinus, UserPlus } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { EstadoInquietud } from "@/lib/data/equipos";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

export function FotoEquipo({ nombre }: { nombre: string }) {
  const [url, setUrl] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local de la foto elegida */}
        {url ? <img src={url} alt={`Foto del equipo ${nombre}`} className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-sm"><Camera size={28} aria-hidden />Sin foto del equipo</span>}
      </div>
      <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold hover:border-brand">
        <Camera size={16} aria-hidden />{url ? "Cambiar foto" : "Subir foto del equipo"}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setUrl(URL.createObjectURL(f)); }} />
      </label>
      <p className="text-xs text-muted">La foto se guarda en la carpeta del equipo en Drive y aparece al tocar su tarjeta.</p>
    </div>
  );
}

type Integrante = { id: string; nombre: string; detalle: string };

export function Integrantes({ inicial }: { inicial: Integrante[] }) {
  const [lista, setLista] = useState(inicial);
  const [retirados, setRetirados] = useState<(Integrante & { motivo: string })[]>([]);
  const [quitando, setQuitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [nuevo, setNuevo] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);

  const agregar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLista((l) => [...l, { id: `n${l.length}`, nombre: `${f.get("nombre")} ${f.get("apellido")}`, detalle: "Nuevo · pendiente de completar en la base" }]);
    setNuevo(false); setFoto(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col">
        {lista.map((m) => (
          <li key={m.id} className="flex flex-col gap-2 border-b border-border py-2 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <span className="flex flex-col text-sm"><strong>{m.nombre}</strong><span className="text-xs text-muted">{m.detalle}</span></span>
              <button type="button" onClick={() => { setQuitando(m.id); setMotivo(""); }} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-warn-ink hover:bg-warn-bg"><UserMinus size={14} aria-hidden />Quitar</button>
            </div>
            {quitando === m.id ? (
              <form className="flex flex-wrap items-end gap-2 rounded-xl bg-surface-2 p-3" onSubmit={(e) => { e.preventDefault(); setRetirados((r) => [...r, { ...m, motivo }]); setLista((l) => l.filter((x) => x.id !== m.id)); setQuitando(null); }}>
                <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">Motivo<input required value={motivo} onChange={(e) => setMotivo(e.target.value)} className={campo} placeholder="Ej. cambio de horario, se mudó…" /></label>
                <Button type="submit">Quitar del equipo</Button>
                <Button type="button" variant="secondary" onClick={() => setQuitando(null)}>Cancelar</Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
      {retirados.length ? (
        <div className="rounded-xl border border-warn-border bg-warn-bg p-3 text-xs text-warn-ink">
          <strong>Retirados ahora:</strong> {retirados.map((r) => `${r.nombre} (${r.motivo})`).join(", ")}. Pasan a la lista de retirados del módulo.
        </div>
      ) : null}
      {nuevo ? (
        <form onSubmit={agregar} className="grid gap-3 rounded-xl bg-surface-2 p-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
          <strong className="col-span-full text-sm">Nuevo integrante</strong>
          <label className="flex flex-col gap-1 text-sm font-semibold">Nombre<input name="nombre" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Apellido<input name="apellido" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Cédula<input name="cedula" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Teléfono<input name="telefono" type="tel" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Correo<input name="correo" type="email" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Fecha de nacimiento<input name="nacimiento" type="date" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Profesión u ocupación<input name="profesion" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Foto
            <input type="file" accept="image/*" className="text-sm font-normal" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFoto(URL.createObjectURL(f)); }} />
          </label>
          {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local */}
          {foto ? <img src={foto} alt="Vista previa" className="size-20 rounded-full object-cover" /> : null}
          <div className="col-span-full flex gap-2"><Button type="submit">Agregar al equipo</Button><Button type="button" variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button></div>
        </form>
      ) : <Button variant="secondary" onClick={() => setNuevo(true)}><UserPlus size={16} aria-hidden />Agregar integrante</Button>}
    </div>
  );
}

type Inq = { id: string; fecha: string; texto: string; autor: string; estado: EstadoInquietud };
const TONO: Record<EstadoInquietud, "warn" | "accent" | "good"> = { Abierta: "warn", "En seguimiento": "accent", Resuelta: "good" };

export function Inquietudes({ inicial }: { inicial: Inq[] }) {
  const [lista, setLista] = useState(inicial);
  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState("Responsable");
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {lista.map((i) => (
          <li key={i.id} className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3 text-sm">
            <span>{i.texto}</span>
            <span className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>{i.autor} · {new Date(`${i.fecha}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</span>
              <span className="flex items-center gap-2">
                <Badge tone={TONO[i.estado]}>{i.estado}</Badge>
                <select aria-label="Cambiar estado" value={i.estado} onChange={(e) => setLista((l) => l.map((x) => (x.id === i.id ? { ...x, estado: e.target.value as EstadoInquietud } : x)))} className="min-h-9 rounded-lg border border-border bg-surface px-2 text-xs">
                  {(["Abierta", "En seguimiento", "Resuelta"] as const).map((s) => <option key={s}>{s}</option>)}
                </select>
              </span>
            </span>
          </li>
        ))}
        {!lista.length ? <li className="text-sm text-muted">Sin inquietudes registradas.</li> : null}
      </ul>
      <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); setLista((l) => [{ id: `n${l.length}`, fecha: "2026-11-01", texto, autor, estado: "Abierta" }, ...l]); setTexto(""); }}>
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} required placeholder="Nueva inquietud del equipo" className={`${campo} min-h-20 py-2`} />
        <div className="flex flex-wrap gap-2">
          <select value={autor} onChange={(e) => setAutor(e.target.value)} className={campo} aria-label="Quién la registra"><option>Responsable</option><option>Administrador</option></select>
          <Button type="submit"><Plus size={16} aria-hidden />Agregar inquietud</Button>
        </div>
      </form>
    </div>
  );
}

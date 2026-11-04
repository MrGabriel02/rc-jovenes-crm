"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { Bell, Plus, Search, UserPlus, X } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { contarEnRango, sugerirEquipo, TIPOS_EVENTO } from "@/lib/domain/equipos";

export interface ResumenEquipo {
  id: string; nombre: string; ciudad: string; responsable: string; dia: string; hora: string; integrantes: number;
  nombresIntegrantes: string[]; edadPromedio: number | null; rangoEdad: string; asistencia: number; alertas: number;
  fechasEventos: string[]; frecuencia: string; inquietudesAbiertas: number;
}

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

/** Avatar del santo patrono: iniciales mientras no se sube la imagen. */
export function AvatarSanto({ nombre, size = 44 }: { nombre: string; size?: number }) {
  const ini = nombre.replace(/^(San|Santa|Santo|Beato|Beata)\s+/i, "").split(" ").map((x) => x[0]).slice(0, 2).join("");
  return (
    <span aria-hidden title={`Patrono: ${nombre}`} style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--nav-2),var(--brand))] font-serif text-sm font-bold text-white ring-2 ring-[var(--gold)]">
      {ini}
    </span>
  );
}

export function PanelEquipos({ equipos }: { equipos: ResumenEquipo[] }) {
  const ciudades = [...new Set(equipos.map((e) => e.ciudad))];
  const [ciudad, setCiudad] = useState<string>("Todas");
  const [desde, setDesde] = useState("2026-10-01");
  const [hasta, setHasta] = useState("2026-10-31");
  const vis = equipos.filter((e) => ciudad === "Todas" || e.ciudad === ciudad);
  const total = vis.reduce((a, e) => a + contarEnRango(e.fechasEventos, desde, hasta), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div role="group" aria-label="Ciudad" className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
          {["Todas", ...ciudades].map((c) => (
            <button key={c} type="button" aria-pressed={ciudad === c} onClick={() => setCiudad(c)} className={clsx("min-h-9 rounded-lg px-3 text-sm font-semibold", ciudad === c ? "bg-surface shadow-sm" : "text-muted")}>{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-xl bg-surface-2 p-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Desde<input type="date" className={campo} value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Hasta<input type="date" className={campo} value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          <span className="flex min-h-11 flex-col justify-center px-2"><strong className="text-2xl tabular-nums">{total}</strong><span className="text-xs text-muted">reuniones en esas fechas</span></span>
        </div>
      </div>
      <ul className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))" }}>
        {vis.map((e) => (
          <li key={e.id}>
            <Link href={`/equipos/${e.id}`} className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-ink no-underline transition-colors hover:border-brand">
              <div className="flex items-center gap-3">
                <AvatarSanto nombre={e.nombre} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <strong className="truncate">{e.nombre}</strong>
                  <span className="truncate text-xs text-muted">{e.ciudad} · {e.dia} {e.hora}</span>
                </div>
                {e.alertas ? <Badge tone="warn">{e.alertas} alerta{e.alertas > 1 ? "s" : ""}</Badge> : null}
              </div>
              <span className="text-xs text-ink-2">Responsable: {e.responsable}</span>
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface-2 p-2"><dt className="text-[11px] text-muted">Integrantes</dt><dd className="text-lg font-extrabold tabular-nums">{e.integrantes}</dd></div>
                <div className="rounded-lg bg-surface-2 p-2"><dt className="text-[11px] text-muted">Reuniones</dt><dd className="text-lg font-extrabold tabular-nums">{contarEnRango(e.fechasEventos, desde, hasta)}</dd></div>
                <div className="rounded-lg bg-surface-2 p-2"><dt className="text-[11px] text-muted">Edades</dt><dd className="text-lg font-extrabold tabular-nums">{e.rangoEdad}</dd></div>
              </dl>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand" style={{ width: `${e.asistencia}%` }} /></div>
                <span className="text-xs font-semibold tabular-nums">{e.asistencia} % asistencia</span>
              </div>
              <span className="text-xs text-muted">Se reúne: {e.frecuencia.toLowerCase()}{e.inquietudesAbiertas ? ` · ${e.inquietudesAbiertas} inquietud${e.inquietudesAbiertas > 1 ? "es" : ""} abierta${e.inquietudesAbiertas > 1 ? "s" : ""}` : ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Buscador de personas con selección múltiple o simple. */
function Buscador({ personas, elegidos, onChange, multiple = true, etiqueta }: { personas: { id: string; nombre: string }[]; elegidos: string[]; onChange: (ids: string[]) => void; multiple?: boolean; etiqueta: string }) {
  const [q, setQ] = useState("");
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const res = q.length < 2 ? [] : personas.filter((p) => norm(p.nombre).includes(norm(q)) && !elegidos.includes(p.id)).slice(0, 6);
  return (
    <div className="flex flex-col gap-1.5 text-sm font-semibold">
      {etiqueta}
      <div className="flex flex-wrap gap-1.5">
        {elegidos.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            {personas.find((p) => p.id === id)?.nombre}
            <button type="button" aria-label="Quitar" onClick={() => onChange(elegidos.filter((x) => x !== id))}><X size={14} /></button>
          </span>
        ))}
      </div>
      {multiple || !elegidos.length ? (
        <label className={clsx(campo, "flex items-center gap-2")}>
          <Search size={16} aria-hidden className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Escribe un nombre" className="w-full bg-transparent font-normal outline-none" />
        </label>
      ) : null}
      {res.length ? (
        <ul className="flex flex-col rounded-xl border border-border bg-surface">
          {res.map((p) => (
            <li key={p.id}><button type="button" className="flex min-h-10 w-full items-center px-3 text-left font-normal hover:bg-surface-2" onClick={() => { onChange(multiple ? [...elegidos, p.id] : [p.id]); setQ(""); }}>{p.nombre}</button></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function NuevoEquipo({ personas }: { personas: { id: string; nombre: string }[] }) {
  const [abierto, setAbierto] = useState(false);
  const [resp, setResp] = useState<string[]>([]);
  const [miembros, setMiembros] = useState<string[]>([]);
  const [listo, setListo] = useState(false);
  if (!abierto) return <Button onClick={() => setAbierto(true)}><Plus size={16} aria-hidden />Nuevo equipo</Button>;
  return (
    <form className="grid w-full gap-3 rounded-2xl border border-brand bg-surface p-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }} onSubmit={(e) => { e.preventDefault(); setListo(true); }}>
      <h2 className="col-span-full text-base font-extrabold">Nuevo equipo de encuentro</h2>
      <label className="flex flex-col gap-1 text-sm font-semibold">Nombre (santo patrono)<input className={campo} required placeholder="Ej. San Benito" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Ciudad<input className={campo} defaultValue="Barquisimeto" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Día estimado de reunión<select className={campo}>{["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((d) => <option key={d}>{d}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Hora estimada<input type="time" className={campo} defaultValue="19:00" /></label>
      <Buscador etiqueta="Responsable" personas={personas} elegidos={resp} onChange={setResp} multiple={false} />
      <Buscador etiqueta={`Integrantes (${miembros.length})`} personas={personas} elegidos={miembros} onChange={setMiembros} />
      <label className="flex flex-col gap-1 text-sm font-semibold">Foto del santo (opcional)<input type="file" accept="image/*" className="text-sm font-normal" /></label>
      <div className="col-span-full flex flex-wrap items-center gap-2">
        <Button type="submit">Crear equipo</Button>
        <Button type="button" variant="secondary" onClick={() => setAbierto(false)}>Cancelar</Button>
        {listo ? <span role="status" className="text-sm text-good-ink">Equipo creado (demo). El responsable recibe su acceso por correo.</span> : null}
      </div>
    </form>
  );
}

export function AvisoResponsables({ equipos }: { equipos: { id: string; nombre: string }[] }) {
  const [abierto, setAbierto] = useState(false);
  const [para, setPara] = useState("todos");
  const [enviado, setEnviado] = useState(false);
  if (!abierto) return <Button variant="secondary" onClick={() => setAbierto(true)}><Bell size={16} aria-hidden />Avisar a responsables</Button>;
  return (
    <form className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5" onSubmit={(e) => { e.preventDefault(); setEnviado(true); }}>
      <h2 className="text-base font-extrabold">Mensaje a responsables</h2>
      <label className="flex flex-col gap-1 text-sm font-semibold">Para
        <select className={campo} value={para} onChange={(e) => setPara(e.target.value)}>
          <option value="todos">Todos los responsables ({equipos.length})</option>
          {equipos.map((e) => <option key={e.id} value={e.id}>Responsable de {e.nombre}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Mensaje<textarea className={clsx(campo, "min-h-24 py-2")} required placeholder="Ej. Recuerden pasar la asistencia de esta semana" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="size-4 accent-brand" />Enviar también por WhatsApp</label>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">Enviar</Button>
        <Button type="button" variant="secondary" onClick={() => setAbierto(false)}>Cerrar</Button>
        {enviado ? <span role="status" className="text-sm text-good-ink">Enviado (demo) como notificación en la plataforma.</span> : null}
      </div>
    </form>
  );
}

type Espera = { nr: number; nombre: string; edad: number | null; procedencia: string; numero: string | null; conocidos: string[]; anadido: string };

export function ListaEspera({ inicial, equipos }: { inicial: Espera[]; equipos: ResumenEquipo[] }) {
  const [lista, setLista] = useState(inicial);
  const [asignados, setAsignados] = useState<Record<number, string>>({});
  const [form, setForm] = useState(false);
  const sugerencias = useMemo(() => Object.fromEntries(lista.map((x) => [x.nr, sugerirEquipo({ edad: x.edad, conocidos: x.conocidos }, equipos.filter((e) => e.ciudad === "Barquisimeto"))?.nombre ?? "—"])), [lista, equipos]);
  const agregar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLista((l) => [...l, { nr: l.length + 1, nombre: String(f.get("nombre")), edad: Number(f.get("edad")) || null, procedencia: String(f.get("procedencia")), numero: String(f.get("numero")), conocidos: String(f.get("conocidos") || "").split(",").map((s) => s.trim()).filter(Boolean), anadido: "2026-11-01" }]);
    setForm(false);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead><tr className="text-left text-muted"><th className="px-2 py-2">Nr</th><th className="px-2 py-2">Nombre</th><th className="px-2 py-2 text-right">Edad</th><th className="px-2 py-2">Procedencia</th><th className="px-2 py-2">Número</th><th className="px-2 py-2">Conocidos</th><th className="px-2 py-2">Añadido</th><th className="px-2 py-2">Equipo sugerido</th><th className="px-2 py-2" /></tr></thead>
          <tbody>
            {lista.map((x) => (
              <tr key={x.nr} className="border-t border-border">
                <td className="px-2 py-2 tabular-nums">{x.nr}</td><td className="px-2 py-2 font-semibold">{x.nombre}</td><td className="px-2 py-2 text-right tabular-nums">{x.edad ?? "—"}</td>
                <td className="px-2 py-2">{x.procedencia}</td><td className="px-2 py-2 tabular-nums">{x.numero}</td><td className="px-2 py-2">{x.conocidos.join(", ") || "—"}</td>
                <td className="px-2 py-2">{new Date(`${x.anadido}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}</td>
                <td className="px-2 py-2">{asignados[x.nr] ? <Badge tone="good">Asignado a {asignados[x.nr]}</Badge> : sugerencias[x.nr]}</td>
                <td className="px-2 py-2">{!asignados[x.nr] ? <button type="button" className="min-h-9 rounded-lg bg-brand px-3 text-xs font-bold text-white" onClick={() => setAsignados((a) => ({ ...a, [x.nr]: sugerencias[x.nr] }))}>Asignar</button> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">La sugerencia busca primero un equipo donde tenga conocidos; si no, el de edad más parecida con menos integrantes. Al asignar, el responsable recibe un aviso para escribirle esa semana.</p>
      {form ? (
        <form onSubmit={agregar} className="grid gap-3 rounded-xl bg-surface-2 p-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}>
          <label className="flex flex-col gap-1 text-sm font-semibold">Nombre<input name="nombre" className={campo} required /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Edad<input name="edad" type="number" min={14} className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Procedencia<input name="procedencia" className={campo} placeholder="Retiro o quién lo invitó" /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Número<input name="numero" type="tel" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Conocidos (separados por coma)<input name="conocidos" className={campo} /></label>
          <div className="flex items-end gap-2"><Button type="submit">Agregar</Button><Button type="button" variant="secondary" onClick={() => setForm(false)}>Cancelar</Button></div>
        </form>
      ) : <Button variant="secondary" onClick={() => setForm(true)}><UserPlus size={16} aria-hidden />Agregar a la lista de espera</Button>}
    </div>
  );
}

export const TIPOS = TIPOS_EVENTO;

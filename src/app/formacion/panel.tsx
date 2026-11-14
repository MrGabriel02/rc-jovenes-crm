"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { Badge, Button, Card, Grid, Kpi } from "@/components/ui";
import { Columnas } from "@/components/charts";

export interface Ponente { id: string; nombre: string; telefono: string; tema: string; profesion: string }
export interface Charla { id: string; fecha: string; tema: string; ponenteId: string | null; asistentes: number | null }

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const corta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function PanelFormacion({ ponentesIni, charlasIni, temasIni, hoy }: { ponentesIni: Ponente[]; charlasIni: Charla[]; temasIni: { tema: string; votos: number }[]; hoy: string }) {
  const [ponentes, setPonentes] = useState(ponentesIni);
  const [charlas, setCharlas] = useState(charlasIni);
  const [temas, setTemas] = useState(temasIni);
  const [editP, setEditP] = useState<string | null>(null);
  const [editC, setEditC] = useState<string | null>(null);
  const [tema, setTema] = useState("");

  const orden = [...charlas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const proximas = orden.filter((c) => c.fecha >= hoy);
  const pasadas = orden.filter((c) => c.fecha < hoy);
  const nombreP = (id: string | null) => ponentes.find((p) => p.id === id)?.nombre ?? null;
  const conAsist = pasadas.filter((c) => c.asistentes !== null);
  const promedio = conAsist.length ? Math.round(conAsist.reduce((a, c) => a + (c.asistentes ?? 0), 0) / conAsist.length) : 0;

  const guardarPonente = (e: React.FormEvent<HTMLFormElement>, id: string | null) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p: Ponente = { id: `pn${ponentes.length + 1}-${String(f.get("nombre")).length}`, nombre: String(f.get("nombre")), telefono: String(f.get("telefono")), tema: String(f.get("tema")), profesion: String(f.get("profesion")) };
    setPonentes((l) => (id && id !== "nuevo" ? l.map((x) => (x.id === id ? { ...p, id } : x)) : [...l, p]));
    setEditP(null);
  };
  const guardarCharla = (e: React.FormEvent<HTMLFormElement>, id: string | null) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const asis = String(f.get("asistentes") ?? "");
    const c: Charla = { id: id && id !== "nueva" ? id : `ch${charlas.length + 1}-${String(f.get("fecha"))}`, fecha: String(f.get("fecha")), tema: String(f.get("tema")), ponenteId: String(f.get("ponente")) || null, asistentes: asis === "" ? null : Number(asis) };
    setCharlas((l) => (id && id !== "nueva" ? l.map((x) => (x.id === id ? c : x)) : [...l, c]));
    setEditC(null);
  };

  const formPonente = (p: Ponente | null) => (
    <form onSubmit={(e) => guardarPonente(e, p?.id ?? "nuevo")} className="grid gap-2 rounded-xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))" }}>
      <label className="flex flex-col gap-1 text-xs font-semibold">Nombre<input name="nombre" required defaultValue={p?.nombre} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Teléfono<input name="telefono" type="tel" defaultValue={p?.telefono} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Tema<input name="tema" required defaultValue={p?.tema} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Profesión<input name="profesion" defaultValue={p?.profesion} className={campo} /></label>
      <span className="col-span-full flex gap-2"><Button type="submit">Guardar</Button><Button type="button" variant="secondary" onClick={() => setEditP(null)}>Cancelar</Button></span>
    </form>
  );
  const formCharla = (c: Charla | null, pasada = false) => (
    <form onSubmit={(e) => guardarCharla(e, c?.id ?? "nueva")} className="grid gap-2 rounded-xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))" }}>
      <label className="flex flex-col gap-1 text-xs font-semibold">Fecha<input name="fecha" type="date" required defaultValue={c?.fecha} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Tema<input name="tema" required defaultValue={c?.tema} list="temas-interes" className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Ponente<select name="ponente" defaultValue={c?.ponenteId ?? ""} className={campo}><option value="">Por asignar</option>{ponentes.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {p.tema}</option>)}</select></label>
      {pasada || (c && c.fecha < hoy) ? <label className="flex flex-col gap-1 text-xs font-semibold">Asistentes<input name="asistentes" type="number" min={0} defaultValue={c?.asistentes ?? ""} className={campo} /></label> : null}
      <span className="col-span-full flex gap-2"><Button type="submit">Guardar</Button><Button type="button" variant="secondary" onClick={() => setEditC(null)}>Cancelar</Button></span>
    </form>
  );
  const acciones = (onEdit: () => void, onDel: () => void, etiqueta: string) => (
    <span className="flex shrink-0 gap-1">
      <button type="button" aria-label={`Editar ${etiqueta}`} onClick={onEdit} className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"><Pencil size={14} /></button>
      <button type="button" aria-label={`Eliminar ${etiqueta}`} onClick={onDel} className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"><Trash2 size={14} /></button>
    </span>
  );

  return (
    <>
      <datalist id="temas-interes">{temas.map((t) => <option key={t.tema} value={t.tema} />)}</datalist>
      <Grid min={180}>
        <Kpi label="Próxima charla" value={proximas[0] ? new Date(`${proximas[0].fecha}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" }) : "—"} note={proximas[0]?.tema} />
        <Kpi label="Ponentes en el banco" value={ponentes.length} />
        <Kpi label="Charlas dadas" value={pasadas.length} />
        <Kpi label="Asistencia promedio" value={promedio} note="Personas por charla" />
      </Grid>
      <Grid min={360}>
        <Card title="Charlas" subtitle="En orden cronológico" action={<Button onClick={() => setEditC("nueva")}><Plus size={16} aria-hidden />Agregar charla</Button>}>
          {editC === "nueva" ? formCharla(null) : null}
          <ul className="flex flex-col gap-2">
            {proximas.map((c) => editC === c.id ? <li key={c.id}>{formCharla(c)}</li> : (
              <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 p-3 text-sm">
                <span className="flex flex-col"><strong>{corta(c.fecha)}</strong><span className="text-xs text-muted">{c.tema}</span></span>
                <span className="flex items-center gap-1">{nombreP(c.ponenteId) ? <Badge tone="good">{nombreP(c.ponenteId)}</Badge> : <Badge tone="warn">Asignar ponente</Badge>}{acciones(() => setEditC(c.id), () => setCharlas((l) => l.filter((x) => x.id !== c.id)), c.tema)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Banco de ponentes" action={<Button onClick={() => setEditP("nuevo")}><Plus size={16} aria-hidden />Agregar ponente</Button>}>
          {editP === "nuevo" ? formPonente(null) : null}
          <ul className="flex flex-col">
            {ponentes.map((p) => editP === p.id ? <li key={p.id} className="py-2">{formPonente(p)}</li> : (
              <li key={p.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
                <span className="flex flex-col"><strong>{p.nombre}</strong><span className="text-xs text-muted">{p.tema} · {p.profesion}</span><a href={`tel:${p.telefono.replace(/\D/g, "")}`} className="text-xs">{p.telefono}</a></span>
                {acciones(() => setEditP(p.id), () => setPonentes((l) => l.filter((x) => x.id !== p.id)), p.nombre)}
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
      <Grid min={360}>
        <Card title="Asistencia a las charlas" subtitle="Personas por charla">
          <Columnas data={conAsist.map((c) => ({ charla: new Date(`${c.fecha}T12:00:00`).toLocaleDateString("es-VE", { month: "short", year: "2-digit" }), personas: c.asistentes ?? 0 }))} x="charla" y="personas" nombre="Asistentes" alto={200} />
        </Card>
        <Card title="Historial de ponentes y temas" subtitle="Toca una charla para cargar o corregir la asistencia">
          <ul className="flex flex-col">
            {[...pasadas].reverse().map((c) => editC === c.id ? <li key={c.id} className="py-2">{formCharla(c, true)}</li> : (
              <li key={c.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
                <span className="flex flex-col"><strong>{c.tema}</strong><span className="text-xs text-muted">{corta(c.fecha)} · {nombreP(c.ponenteId) ?? "Sin ponente"}</span></span>
                <span className="flex items-center gap-1">{c.asistentes !== null ? <Badge><Users size={12} aria-hidden /> {c.asistentes}</Badge> : <Badge tone="warn">Sin asistencia</Badge>}{acciones(() => setEditC(c.id), () => setCharlas((l) => l.filter((x) => x.id !== c.id)), c.tema)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
      <Card title="Temas de interés" subtitle="Lo que piden los jóvenes: aparecen como sugerencia al agregar una charla">
        <ul className="flex flex-wrap gap-2">
          {[...temas].sort((a, b) => b.votos - a.votos).map((t) => (
            <li key={t.tema}>
              <button type="button" onClick={() => setTemas((l) => l.map((x) => (x.tema === t.tema ? { ...x, votos: x.votos + 1 } : x)))} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 text-sm hover:border-brand" aria-label={`Sumar un voto a ${t.tema}`}>
                {t.tema}<span className="text-xs font-bold text-muted">{t.votos}</span>
              </button>
            </li>
          ))}
        </ul>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (tema.trim()) setTemas((l) => [...l, { tema: tema.trim(), votos: 1 }]); setTema(""); }}>
          <input value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Nuevo tema" aria-label="Nuevo tema de interés" className={`${campo} flex-1`} />
          <Button type="submit" variant="secondary"><Plus size={16} aria-hidden />Añadir tema</Button>
        </form>
      </Card>
    </>
  );
}

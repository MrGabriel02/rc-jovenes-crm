"use client";

import { useState } from "react";
import { CalendarPlus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { choquesConCulto, horaLegible } from "@/lib/domain/culto";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
type Op = { id: string; nombre: string };

export function NuevaActividad({ tipos, apostolados, espacios, personas, directores }: { tipos: Op[]; apostolados: Op[]; espacios: Op[]; personas: Op[]; directores: Op[] }) {
  const [lugar, setLugar] = useState(espacios[0]?.id ?? "fuera");
  const [fecha, setFecha] = useState("2026-11-12");
  const [hIni, setHIni] = useState("18:00");
  const [hFin, setHFin] = useState("19:30");
  const [hecho, setHecho] = useState<string | null>(null);
  const minutos = (() => { const [a, b] = hIni.split(":").map(Number); const [c, d] = hFin.split(":").map(Number); return c * 60 + d - (a * 60 + b); })();
  const choques = fecha && minutos > 0 ? choquesConCulto({ espacioId: lugar, inicio: `${fecha}T${hIni}:00`, minutos }) : [];

  return (
    <form
      className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setHecho(`“${f.get("nombre")}” quedó en el calendario el ${new Date(`${fecha}T12:00:00`).toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" })} a las ${horaLegible(hIni)}. Se avisa al responsable y al director, y se crea el evento en Google Calendar.`);
      }}
    >
      <label className="col-span-full flex flex-col gap-1 text-sm font-semibold">Nombre de la actividad<input name="nombre" required className={campo} placeholder="Ej. Círculo de estudio de diciembre" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Tipo<select name="tipo" className={campo}>{tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">De quién es<select name="apostolado" className={campo}><option value="">Sección (general)</option>{apostolados.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Fecha<input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className={campo} /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Fecha de fin (si dura varios días)<input name="fin" type="date" min={fecha} className={campo} /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Hora de inicio<input type="time" required value={hIni} onChange={(e) => setHIni(e.target.value)} className={campo} /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Hora de fin<input type="time" required value={hFin} onChange={(e) => setHFin(e.target.value)} className={campo} /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Lugar<select value={lugar} onChange={(e) => setLugar(e.target.value)} className={campo}>{espacios.map((s) => <option key={s.id} value={s.id}>{s.nombre} (casa)</option>)}<option value="fuera">Fuera de la casa</option></select></label>
      {lugar === "fuera" ? <label className="flex flex-col gap-1 text-sm font-semibold">Dirección<input name="direccion" required className={campo} /></label> : null}
      <label className="flex flex-col gap-1 text-sm font-semibold">Responsable<select name="responsable" className={campo}>{personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Director o asesor<select name="director" className={campo}><option value="">Sin director</option>{directores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Cupo<input name="cupo" type="number" min={0} className={campo} placeholder="Sin límite" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Costo de inscripción (USD)<input name="costo" type="number" min={0} step="0.01" className={campo} placeholder="0" /></label>
      <label className="col-span-full flex flex-col gap-1 text-sm font-semibold">Descripción<textarea name="descripcion" className={`${campo} min-h-20 py-2`} /></label>
      <fieldset className="col-span-full flex flex-wrap gap-x-5">
        <legend className="sr-only">Opciones</legend>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="inscripcion" className="size-4" />Crear formulario de inscripción</label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="seguimiento" className="size-4" />Activar seguimiento post retiro</label>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="notificar" defaultChecked className="size-4" />Notificar a la sección</label>
      </fieldset>
      {minutos <= 0 ? <p className="col-span-full text-sm text-warn-ink">La hora de fin debe ser después de la de inicio.</p> : null}
      {choques.length ? (
        <p role="alert" className="col-span-full flex items-start gap-2 rounded-xl border border-warn-border bg-warn-bg p-3 text-sm text-warn-ink">
          <TriangleAlert size={16} aria-hidden className="mt-0.5 shrink-0" />La capilla está ocupada: {choques.map((c) => `${c.tipo} a las ${horaLegible(c.inicio)}`).join(", ")}. Elige otra hora u otro lugar.
        </p>
      ) : null}
      <div className="col-span-full"><Button type="submit" disabled={minutos <= 0 || choques.length > 0}><CalendarPlus size={16} aria-hidden />Añadir al calendario</Button></div>
      {hecho ? <p role="status" className="col-span-full rounded-xl bg-good-bg p-3 text-sm text-good-ink">{hecho}</p> : null}
    </form>
  );
}

"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";

type Sesion = { id: string; persona: string; director: string; inicio: string };

export function Confirmaciones({ sesiones: ini, personas = [], directores = [] }: { sesiones: Sesion[]; personas?: string[]; directores?: string[] }) {
  const [sesiones, setSesiones] = useState(ini);
  const [res, setRes] = useState<Record<string, "realizada" | "no_realizada">>({});
  const [registrar, setRegistrar] = useState(false);
  const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
  return (
    <Card title="¿Se realizó la DE?" subtitle="Lo que recibe el director como notificación al terminar cada cita. Sin respuesta en 48 h queda “sin confirmar” y no suma.">
      <ul className="flex flex-col gap-2">
        {sesiones.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3">
            <div className="flex min-w-48 flex-1 flex-col">
              <strong className="text-sm">{s.persona}</strong>
              <span className="text-xs text-muted">{s.director} · {new Date(s.inicio).toLocaleString("es-VE", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {res[s.id] ? (
              <Badge tone={res[s.id] === "realizada" ? "good" : "neutral"}>{res[s.id] === "realizada" ? "Realizada" : "No se realizó"}</Badge>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setRes((r) => ({ ...r, [s.id]: "realizada" }))}>Sí, se realizó</Button>
                <Button variant="secondary" onClick={() => setRes((r) => ({ ...r, [s.id]: "no_realizada" }))}>No</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {registrar ? (
        <form className="grid gap-2 rounded-xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))" }} onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const id = `manual-${sesiones.length}`;
          setSesiones((l) => [{ id, persona: String(f.get("persona")), director: String(f.get("director")), inicio: `${f.get("fecha")}T${f.get("hora")}:00` }, ...l]);
          setRes((r) => ({ ...r, [id]: "realizada" }));
          setRegistrar(false);
        }}>
          <label className="flex flex-col gap-1 text-xs font-semibold">Joven<input name="persona" list="de-personas" required className={campo} /><datalist id="de-personas">{personas.map((p) => <option key={p} value={p} />)}</datalist></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Director<select name="director" className={campo}>{directores.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Fecha<input name="fecha" type="date" required defaultValue={ini[0]?.inicio.slice(0, 10)} className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Hora<input name="hora" type="time" required defaultValue="17:00" className={campo} /></label>
          <span className="col-span-full flex gap-2"><Button type="submit">Registrar como realizada</Button><Button type="button" variant="secondary" onClick={() => setRegistrar(false)}>Cancelar</Button></span>
        </form>
      ) : <Button variant="secondary" className="self-start" onClick={() => setRegistrar(true)}>Registrar una DE acordada en persona</Button>}
    </Card>
  );
}

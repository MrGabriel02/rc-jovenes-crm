"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui";

type Datos = { nombre: string; apellido: string; cedula: string; telefono: string; correo: string; fechaNacimiento: string; zona: string; profesion: string };
const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

export function EditarPersona({ inicial }: { inicial: Datos }) {
  const [abierto, setAbierto] = useState(false);
  const [d, setD] = useState(inicial);
  const [guardado, setGuardado] = useState(false);
  const set = (k: keyof Datos) => (e: React.ChangeEvent<HTMLInputElement>) => { setD({ ...d, [k]: e.target.value }); setGuardado(false); };
  if (!abierto) return <Button variant="secondary" onClick={() => setAbierto(true)}><Pencil size={16} aria-hidden />Editar datos</Button>;
  const etiquetas: [keyof Datos, string, string?][] = [["nombre", "Nombre"], ["apellido", "Apellido"], ["cedula", "Cédula"], ["telefono", "Teléfono", "tel"], ["correo", "Correo", "email"], ["fechaNacimiento", "Fecha de nacimiento", "date"], ["zona", "Zona"], ["profesion", "Profesión"]];
  return (
    <form className="grid gap-3 rounded-2xl border border-border bg-surface p-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}
      onSubmit={(e) => { e.preventDefault(); setGuardado(true); }}>
      {etiquetas.map(([k, l, t]) => (
        <label key={k} className="flex flex-col gap-1 text-sm font-semibold">{l}<input className={campo} type={t ?? "text"} value={d[k]} onChange={set(k)} /></label>
      ))}
      <div className="flex flex-wrap items-end gap-2">
        <Button type="submit">Guardar cambios</Button>
        <Button type="button" variant="secondary" onClick={() => setAbierto(false)}>Cerrar</Button>
      </div>
      {guardado ? <p role="status" className="text-sm text-good-ink">Guardado (demo). En la versión real se actualiza la ficha y la hoja general de Sheets.</p> : null}
    </form>
  );
}

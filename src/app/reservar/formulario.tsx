"use client";

import { useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import { conflictos, precioReserva } from "@/lib/domain/reservas";
import { usd } from "@/lib/domain/economia";
import type { Espacio, Reserva, TipoSolicitante } from "@/lib/domain/types";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

export function FormularioReserva({ espacios, reservas }: { espacios: Espacio[]; reservas: Reserva[] }) {
  const [espacioId, setEspacio] = useState(espacios[0].id);
  const [fecha, setFecha] = useState("2026-11-04");
  const [horaIni, setHora] = useState("18:00");
  const [bloques, setBloques] = useState(1);
  const [tipo, setTipo] = useState<TipoSolicitante>("apostolado");
  const [enviado, setEnviado] = useState(false);
  const esp = espacios.find((e) => e.id === espacioId)!;
  const nueva: Reserva = { id: "nueva", espacioId, inicio: `${fecha}T${horaIni}:00`, bloques, solicitante: "", tipoSolicitante: tipo, responsable: "", telefono: "", motivo: "", aprobaciones: [] };
  const choques = useMemo(() => conflictos(nueva, reservas, ["dir1", "dir2"]), [espacioId, fecha, horaIni, bloques, tipo]); // eslint-disable-line react-hooks/exhaustive-deps
  const precio = precioReserva(esp.tipo, bloques, tipo);

  return (
    <Card>
      <form className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }} onSubmit={(e) => { e.preventDefault(); setEnviado(true); }}>
        <label className="flex flex-col gap-1 text-sm font-semibold">Espacio
          <select className={campo} value={espacioId} onChange={(e) => setEspacio(e.target.value)}>{espacios.map((e) => <option key={e.id} value={e.id}>{e.nombre}{e.capacidad ? ` (${e.capacidad} personas)` : ""}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Fecha<input className={campo} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Hora de inicio<input className={campo} type="time" value={horaIni} onChange={(e) => setHora(e.target.value)} required /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Bloques de 1,5 h<input className={campo} type="number" min={1} max={6} value={bloques} onChange={(e) => setBloques(Number(e.target.value) || 1)} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Quién solicita
          <select className={campo} value={tipo} onChange={(e) => setTipo(e.target.value as TipoSolicitante)}>
            <option value="apostolado">Apostolado o equipo de la sección de Jóvenes</option><option value="otra_seccion">Otra sección (Señores, Jóvenes Señores)</option><option value="externo">Persona o institución externa</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Nombre del apostolado, sección o institución<input className={campo} required /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Responsable<input className={campo} required /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Teléfono<input className={campo} type="tel" required /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Motivo<input className={campo} required /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Número de personas<input className={campo} type="number" min={1} /></label>
        <div className="flex flex-col justify-end gap-2 rounded-xl bg-surface-2 p-3 text-sm">
          <span>Costo: <strong>{precio ? usd(precio) : "Sin costo"}</strong></span>
          {choques.length ? <span className="font-semibold text-warn-ink" role="alert">Ese horario ya está ocupado o pendiente. Elige otra hora.</span> : <span className="text-good-ink">Horario disponible</span>}
        </div>
        <div className="flex items-end"><Button type="submit" disabled={choques.length > 0}>Enviar solicitud</Button></div>
      </form>
      {enviado ? <p role="status" className="rounded-xl bg-good-bg p-3 text-sm text-good-ink">Solicitud enviada (demo). Los directores reciben una notificación para aprobarla y te confirmaremos por WhatsApp.</p> : null}
    </Card>
  );
}

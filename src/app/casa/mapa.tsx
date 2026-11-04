"use client";

import { useState } from "react";
import clsx from "clsx";
import { Cctv, Users, Wrench } from "lucide-react";
import { Badge, LinkButton } from "@/components/ui";
import { estadoReserva, finReserva, TARIFAS } from "@/lib/domain/reservas";
import { usd } from "@/lib/domain/economia";
import type { Espacio, Reserva } from "@/lib/domain/types";
import type { Camara } from "@/lib/data/camaras";

/**
 * Plano interactivo de la casa, dibujado a partir de los planos de distribución.
 * Cada zona es un rectángulo en un viewBox por planta; las zonas con espacioId
 * son reservables y se conectan con reservas, tarifas y cámaras.
 */
type Zona = { id: string; nombre: string; x: number; y: number; w: number; h: number; espacioId?: string; nota?: string; punteada?: boolean };
type Planta = { id: "baja" | "alta" | "auditorio"; nombre: string; viewBox: string; zonas: Zona[] };

const PLANTAS: Planta[] = [
  {
    id: "baja", nombre: "Planta baja", viewBox: "0 0 660 520",
    zonas: [
      { id: "oficina", nombre: "Oficina", x: 15, y: 10, w: 85, h: 205 },
      { id: "cap", nombre: "Capilla", x: 100, y: 10, w: 240, h: 205, espacioId: "cap" },
      { id: "entrada", nombre: "Entrada", x: 340, y: 10, w: 110, h: 205 },
      { id: "recepcion", nombre: "Recepción", x: 15, y: 215, w: 85, h: 80 },
      { id: "bano1", nombre: "Baño 01", x: 15, y: 295, w: 85, h: 55 },
      { id: "estar", nombre: "Estar", x: 100, y: 215, w: 240, h: 130 },
      { id: "escalera-b", nombre: "Escalera", x: 340, y: 275, w: 105, h: 70 },
      { id: "sacristia", nombre: "Sacristía", x: 450, y: 215, w: 45, h: 60 },
      { id: "cafetin", nombre: "Cafetín", x: 495, y: 215, w: 140, h: 130, nota: "Paga 10 % de las ventas + alquiler" },
      { id: "mesas-izq", nombre: "Mesas", x: 100, y: 345, w: 115, h: 70 },
      { id: "conf", nombre: "Sala de conferencias", x: 215, y: 345, w: 235, h: 150, espacioId: "conf" },
      { id: "mesas-der", nombre: "Mesas", x: 450, y: 345, w: 115, h: 150, nota: "Mesas del cafetín" },
      { id: "bano2", nombre: "Baño 02", x: 565, y: 345, w: 70, h: 70 },
    ],
  },
  {
    id: "alta", nombre: "Planta alta", viewBox: "0 0 900 540",
    zonas: [
      { id: "s1", nombre: "Salón 1", x: 20, y: 10, w: 115, h: 290, espacioId: "s1" },
      { id: "s2", nombre: "Salón 2", x: 135, y: 10, w: 170, h: 140, espacioId: "s2" },
      { id: "banos-a", nombre: "Baños", x: 305, y: 10, w: 165, h: 105 },
      { id: "s3", nombre: "Salón 3", x: 470, y: 10, w: 160, h: 220, espacioId: "s3" },
      { id: "closets", nombre: "Oficina y closets", x: 135, y: 195, w: 170, h: 230 },
      { id: "pasillo", nombre: "Pasillo y estar", x: 305, y: 115, w: 165, h: 415 },
      { id: "escalera-a", nombre: "Escalera", x: 470, y: 230, w: 160, h: 105 },
      { id: "s4", nombre: "Salón 4", x: 630, y: 150, w: 160, h: 135, espacioId: "s4" },
      { id: "deposito", nombre: "Depósitos", x: 790, y: 150, w: 95, h: 275 },
      { id: "estar-a", nombre: "Estar", x: 470, y: 335, w: 160, h: 195 },
      { id: "s5", nombre: "Salón 5", x: 630, y: 385, w: 160, h: 145, espacioId: "s5" },
    ],
  },
  {
    id: "auditorio", nombre: "Auditorio y terraza", viewBox: "0 0 660 520",
    zonas: [
      { id: "esc", nombre: "Escenario", x: 210, y: 20, w: 215, h: 70 },
      { id: "vestibulo", nombre: "Vestíbulo", x: 110, y: 90, w: 430, h: 125 },
      { id: "jardin", nombre: "Jardín", x: 15, y: 215, w: 95, h: 190 },
      { id: "aud", nombre: "Auditorio", x: 110, y: 215, w: 430, h: 190, espacioId: "aud" },
      { id: "ter", nombre: "Terraza", x: 110, y: 425, w: 430, h: 80, espacioId: "ter", punteada: true, nota: "Ubicación aproximada: falta su plano" },
    ],
  },
];

type Estado = "libre" | "ocupado" | "pendiente" | "mantenimiento" | "comun";

const ESTILO: Record<Estado, { fill: string; label: string }> = {
  libre: { fill: "color-mix(in oklab, var(--good-ink) 22%, var(--surface))", label: "Libre ahora" },
  ocupado: { fill: "color-mix(in oklab, var(--brand) 30%, var(--surface))", label: "Reservado ahora" },
  pendiente: { fill: "color-mix(in oklab, var(--series-2) 26%, var(--surface))", label: "Con solicitud por aprobar" },
  mantenimiento: { fill: "color-mix(in oklab, var(--gold) 34%, var(--surface))", label: "Con mantenimiento abierto" },
  comun: { fill: "var(--surface-2)", label: "Área común (no se reserva)" },
};

export function MapaCasa({ espacios, reservas, directores, camaras, mantenimiento, ahora }: {
  espacios: Espacio[]; reservas: Reserva[]; directores: string[]; camaras: Camara[];
  mantenimiento: { titulo: string; estado: string }[]; ahora: string;
}) {
  const [planta, setPlanta] = useState<Planta["id"]>("alta");
  const [sel, setSel] = useState<string>("s3");
  const p = PLANTAS.find((x) => x.id === planta)!;
  const t = new Date(ahora).getTime();

  const infoZona = (z: Zona) => {
    const esp = z.espacioId ? espacios.find((e) => e.id === z.espacioId) : undefined;
    const res = esp ? reservas.filter((r) => r.espacioId === esp.id && estadoReserva(r, directores) !== "rechazada") : [];
    const ahoraRes = res.find((r) => estadoReserva(r, directores) === "aprobada" && new Date(r.inicio).getTime() <= t && finReserva(r).getTime() > t);
    const proximas = res.filter((r) => finReserva(r).getTime() > t).sort((a, b) => a.inicio.localeCompare(b.inicio));
    const mant = mantenimiento.filter((m) => m.estado !== "Resuelto" && m.titulo.toLowerCase().includes(z.nombre.toLowerCase()));
    const cams = camaras.filter((c) => c.espacioId === (z.espacioId ?? z.id));
    let estado: Estado = "comun";
    if (esp) estado = mant.length ? "mantenimiento" : ahoraRes ? "ocupado" : proximas.some((r) => estadoReserva(r, directores) === "pendiente") ? "pendiente" : "libre";
    return { esp, ahoraRes, proximas, mant, cams, estado };
  };

  const zonaSel = p.zonas.find((z) => z.id === sel) ?? p.zonas.find((z) => z.espacioId)!;
  const info = infoZona(zonaSel);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div role="tablist" aria-label="Plantas de la casa" className="flex gap-1 self-start rounded-xl bg-surface-2 p-1">
          {PLANTAS.map((x) => (
            <button key={x.id} role="tab" type="button" aria-selected={planta === x.id}
              onClick={() => { setPlanta(x.id); setSel(x.zonas.find((z) => z.espacioId)!.id); }}
              className={clsx("min-h-10 rounded-lg px-3 text-sm font-semibold", planta === x.id ? "bg-surface text-ink shadow-sm" : "text-muted")}>{x.nombre}</button>
          ))}
        </div>
        <svg viewBox={p.viewBox} role="group" aria-label={`Plano de ${p.nombre}`} className="h-auto w-full select-none">
          {p.zonas.map((z) => {
            const i = infoZona(z);
            const activa = z.id === zonaSel.id;
            const reservable = Boolean(z.espacioId);
            return (
              <g key={z.id}
                role="button" tabIndex={0} aria-pressed={activa}
                aria-label={`${z.nombre}: ${ESTILO[i.estado].label}`}
                onClick={() => setSel(z.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(z.id); } }}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--gold)]">
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={6}
                  fill={ESTILO[i.estado].fill}
                  stroke={activa ? "var(--brand)" : "var(--border)"} strokeWidth={activa ? 4 : reservable ? 2 : 1.5}
                  strokeDasharray={z.punteada ? "8 6" : undefined} />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 - (z.espacioId ? 6 : 0)} textAnchor="middle" dominantBaseline="middle"
                  fontSize={Math.min(16, (z.w - 8) / (z.nombre.length * 0.58))} fontWeight={reservable ? 800 : 600} fill={reservable ? "var(--ink)" : "var(--muted)"}>{z.nombre}</text>
                {i.esp?.capacidad ? (
                  <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 16} textAnchor="middle" fontSize={13} fill="var(--ink-2)">{i.esp.capacidad} personas</text>
                ) : null}
                {i.cams.length ? (
                  <g transform={`translate(${z.x + z.w - 26}, ${z.y + 8})`} aria-hidden>
                    <rect width={18} height={18} rx={4} fill="var(--brand)" />
                    <circle cx={9} cy={9} r={4} fill="#fff" />
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-label="Leyenda">
          {(Object.keys(ESTILO) as Estado[]).map((k) => (
            <li key={k} className="flex items-center gap-1.5"><span aria-hidden className="size-3 rounded-sm border border-border" style={{ background: ESTILO[k].fill }} />{ESTILO[k].label}</li>
          ))}
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-3 rounded-sm bg-brand" />Cámara de seguridad</li>
        </ul>
      </div>

      <aside aria-live="polite" className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-extrabold">{zonaSel.nombre}</h3>
          <Badge tone={info.estado === "libre" ? "good" : info.estado === "mantenimiento" ? "warn" : info.estado === "comun" ? "neutral" : "accent"}>{ESTILO[info.estado].label}</Badge>
        </div>
        {zonaSel.nota ? <p className="text-xs text-muted">{zonaSel.nota}</p> : null}
        {info.esp ? (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="flex items-center gap-1 text-muted"><Users size={14} aria-hidden /> Capacidad</dt><dd>{info.esp.capacidad ?? "—"}</dd>
              <dt className="text-muted">Tarifa</dt><dd>{TARIFAS[info.esp.tipo] ? `${usd(TARIFAS[info.esp.tipo])} por bloque de 1,5 h` : "Sin costo"}</dd>
              <dt className="text-muted">Apostolados</dt><dd>No pagan</dd>
            </dl>
            <div className="flex flex-col gap-1.5">
              <strong className="text-sm">Próximas reservas</strong>
              {info.proximas.length ? (
                <ul className="flex flex-col gap-1.5">
                  {info.proximas.slice(0, 4).map((r) => (
                    <li key={r.id} className="flex flex-col rounded-lg bg-surface-2 px-3 py-2 text-xs">
                      <span className="font-bold">{new Date(r.inicio).toLocaleString("es-VE", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                      <span className="text-ink-2">{r.solicitante} · {r.motivo}</span>
                      {estadoReserva(r, directores) === "pendiente" ? <span className="text-accent">Por aprobar ({r.aprobaciones.length} de {directores.length})</span> : null}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-muted">Sin reservas próximas.</p>}
            </div>
            <LinkButton href={`/reservar?espacio=${info.esp.id}`}>Solicitar este espacio</LinkButton>
          </>
        ) : <p className="text-sm text-ink-2">Área común. No se reserva por separado.</p>}
        {info.mant.length ? (
          <div className="flex flex-col gap-1 rounded-lg border border-warn-border bg-warn-bg p-3 text-xs text-warn-ink">
            {info.mant.map((m) => <span key={m.titulo} className="flex items-center gap-1.5"><Wrench size={14} aria-hidden />{m.titulo} · {m.estado}</span>)}
          </div>
        ) : null}
        {info.cams.length ? (
          <div className="flex flex-col gap-1.5">
            <strong className="text-sm">Cámaras</strong>
            {info.cams.map((c) => (
              <a key={c.id} href={`/camaras#${c.id}`} className="flex items-center gap-2 text-sm font-semibold"><Cctv size={16} aria-hidden />{c.nombre}</a>
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

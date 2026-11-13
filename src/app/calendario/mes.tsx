"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { useHoy } from "@/components/hoy";

export type Categoria = "actividad" | "reserva" | "culto" | "liturgia";
export interface EventoCal { id: string; fecha: string; hora?: string; titulo: string; categoria: Categoria; tipo: string }

const PUNTO: Record<Categoria, string> = { actividad: "bg-brand", reserva: "bg-[var(--series-2)]", culto: "bg-[var(--gold)]", liturgia: "bg-[var(--ink-2)]" };
const CATEGORIAS: { id: Categoria; nombre: string; clase: string }[] = [
  { id: "actividad", nombre: "Actividades y encuentros", clase: "bg-accent-soft text-accent" },
  { id: "reserva", nombre: "Reservas de la casa", clase: "bg-[color-mix(in_oklab,var(--series-2)_18%,var(--surface))] text-[var(--series-2)]" },
  { id: "culto", nombre: "Misas y hora eucarística", clase: "bg-[color-mix(in_oklab,var(--gold)_20%,var(--surface))] text-[var(--gold)]" },
  { id: "liturgia", nombre: "Fiestas litúrgicas", clase: "bg-surface-2 text-ink-2 ring-1 ring-border" },
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const aIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const deIso = (s: string) => new Date(`${s}T12:00:00`);
const mas = (s: string, dias: number) => { const d = deIso(s); d.setDate(d.getDate() + dias); return aIso(d); };
const lunes = (s: string) => mas(s, -((deIso(s).getDay() + 6) % 7));
const mesTexto = (s: string) => deIso(s).toLocaleDateString("es-VE", { month: "long", year: "numeric" });

/** Calendario con vista de mes y de semana, filtros por categoría y por tipo de actividad. */
export function CalendarioMes({ eventos, tipos, desde, hasta }: { eventos: EventoCal[]; tipos: string[]; desde: string; hasta: string }) {
  const hoy = useHoy("2026-11-01T09").fecha;
  const [activas, setActivas] = useState<Set<Categoria>>(new Set(["actividad", "reserva", "culto", "liturgia"]));
  const [tipo, setTipo] = useState("todos");
  const [vista, setVista] = useState<"mes" | "semana">("mes");
  const [cursor, setCursor] = useState<string | null>(null);
  const ref = cursor ?? hoy;

  const visibles = useMemo(
    () => eventos.filter((e) => activas.has(e.categoria) && (tipo === "todos" || e.categoria !== "actividad" || e.tipo === tipo)),
    [eventos, activas, tipo],
  );
  const delDia = (d: string) => visibles.filter((e) => e.fecha === d);
  const alternar = (c: Categoria) => setActivas((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const clase = (c: Categoria) => CATEGORIAS.find((x) => x.id === c)!.clase;

  // Mes
  const r = deIso(ref);
  const anio = r.getFullYear(), mes = r.getMonth();
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const celdas = Array.from({ length: Math.ceil((offset + diasMes) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= diasMes ? aIso(new Date(anio, mes, d)) : null;
  });
  // Semana
  const ini = lunes(ref);
  const semana = Array.from({ length: 7 }, (_, i) => mas(ini, i));

  const mover = (paso: number) => {
    if (vista === "semana") return setCursor(mas(ini, paso * 7));
    const d = new Date(anio, mes + paso, 1);
    setCursor(aIso(d));
  };
  const titulo = vista === "mes"
    ? mesTexto(ref)
    : `${deIso(semana[0]).toLocaleDateString("es-VE", { day: "numeric", month: "short" })} al ${deIso(semana[6]).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}`;
  const fueraDeRango = (vista === "mes" ? `${aIso(new Date(anio, mes + 1, 0))}` < desde || aIso(new Date(anio, mes, 1)) > hasta : semana[6] < desde || semana[0] > hasta);

  const evento = (e: EventoCal, largo?: boolean) => (
    <li key={e.id} className={clsx("rounded px-1.5 py-0.5 font-semibold", clase(e.categoria), largo ? "text-xs leading-snug" : "truncate")} title={`${e.hora ? `${e.hora} · ` : ""}${e.titulo}`}>
      {e.hora ? <span className="font-normal tabular-nums">{e.hora} </span> : null}{e.titulo}
    </li>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => mover(-1)} aria-label={vista === "mes" ? "Mes anterior" : "Semana anterior"} className="flex size-10 items-center justify-center rounded-xl border border-border hover:border-brand"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => mover(1)} aria-label={vista === "mes" ? "Mes siguiente" : "Semana siguiente"} className="flex size-10 items-center justify-center rounded-xl border border-border hover:border-brand"><ChevronRight size={18} /></button>
          <button type="button" onClick={() => setCursor(null)} className="min-h-10 rounded-xl border border-border px-3 text-sm font-semibold hover:border-brand">Hoy</button>
        </div>
        <h3 className="min-w-0 flex-1 text-lg font-extrabold first-letter:uppercase" aria-live="polite">{titulo}</h3>
        <div role="group" aria-label="Vista" className="flex gap-1 rounded-xl bg-surface-2 p-1 text-sm font-semibold">
          {([["mes", "Mes", CalendarDays], ["semana", "Semana", CalendarRange]] as const).map(([v, l, Icon]) => (
            <button key={v} type="button" aria-pressed={vista === v} onClick={() => setVista(v)} className={clsx("flex min-h-9 items-center gap-1.5 rounded-lg px-3", vista === v ? "bg-surface shadow-sm" : "text-muted")}><Icon size={16} aria-hidden />{l}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtros del calendario">
        {CATEGORIAS.map((c) => (
          <button key={c.id} type="button" aria-pressed={activas.has(c.id)} onClick={() => alternar(c.id)}
            className={clsx("flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors", activas.has(c.id) ? "border-brand bg-surface text-ink" : "border-border bg-surface-2 text-muted line-through")}>
            <span aria-hidden className={clsx("hidden size-3 rounded-sm sm:block", c.clase)} /><span aria-hidden className={clsx("size-2.5 rounded-full sm:hidden", PUNTO[c.id])} />{c.nombre}
          </button>
        ))}
        <label className="flex items-center gap-2 text-xs font-semibold text-muted sm:ml-auto">Tipo de actividad
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="min-h-10 rounded-lg border border-border bg-surface px-2 text-sm text-ink">
            <option value="todos">Todos</option>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      {fueraDeRango ? <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">La demostración tiene datos de actividades entre {mesTexto(desde)} y {mesTexto(hasta)}. Aquí solo se ven misas y fiestas cuando se conecte el calendario real.</p> : null}

      {vista === "mes" ? (
        <div className="flex flex-col gap-2">
        <p className="text-xs text-muted sm:hidden">Cada punto es un tipo de evento. Toca un día para ver su semana con el detalle.</p>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 text-xs sm:min-w-[640px]">
            {DIAS.map((d) => <div key={d} className="px-1 py-1 font-bold text-muted">{d}</div>)}
            {celdas.map((d, i) => (
              <div key={i} className={clsx("min-h-14 rounded-lg border p-1 sm:min-h-28 sm:p-1.5", d ? "border-border bg-surface" : "border-transparent", d === hoy && "ring-2 ring-brand")}>
                {d ? (
                  <>
                    <button type="button" onClick={() => { setCursor(d); setVista("semana"); }} aria-label={`Ver la semana del ${deIso(d).toLocaleDateString("es-VE", { day: "numeric", month: "long" })}`} className="flex min-h-8 min-w-8 items-center justify-center rounded font-bold hover:bg-surface-2 sm:min-h-0 sm:min-w-0 sm:justify-start sm:px-1">{Number(d.slice(8))}</button>
                    <ul className="mt-1 hidden flex-col gap-1 sm:flex">
                      {delDia(d).map((e) => evento(e))}
                    </ul>
                    <span aria-hidden className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                      {[...new Set(delDia(d).map((e) => e.categoria))].map((c) => <span key={c} className={clsx("size-2 rounded-full", PUNTO[c])} />)}
                    </span>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        </div>
      ) : (
        <ol className="grid gap-2 md:grid-cols-7 md:gap-1">
          {semana.map((d, i) => {
            const evs = delDia(d);
            return (
              <li key={d} className={clsx("flex flex-col gap-1.5 rounded-xl border p-2 md:min-h-64", d === hoy ? "border-brand ring-2 ring-brand" : "border-border bg-surface")}>
                <span className="flex items-baseline gap-1.5 md:flex-col md:items-start md:gap-0">
                  <span className="text-xs font-bold uppercase text-muted">{DIAS[i]}</span>
                  <span className="text-lg font-extrabold tabular-nums leading-none">{Number(d.slice(8))}</span>
                  {d === hoy ? <span className="text-[11px] font-bold text-brand">Hoy</span> : null}
                </span>
                {evs.length ? <ul className="flex flex-col gap-1">{evs.map((e) => evento(e, true))}</ul> : <span className="text-xs text-muted">Sin eventos</span>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Church } from "lucide-react";
import { TONO_LITURGICO, diaLiturgico, fraseDelDia, proximaCelebracion } from "@/lib/domain/liturgia";
import { cultosDelDia, horaLegible } from "@/lib/domain/culto";
import { fechaLarga } from "@/lib/domain/fechas";
import { saludoPorHora, useHoy } from "./hoy";

const RANGO: Record<string, string> = { solemnidad: "Solemnidad", fiesta: "Fiesta", memoria: "Memoria", domingo: "Domingo", feria: "Feria" };

export interface Novedad { titulo: string; valor: ReactNode; href: string; icono: ReactNode }

/**
 * Portada del inicio. La fecha, el día litúrgico, la frase y la misa del día se calculan
 * con el día real de Venezuela, así que cambian solas cada día.
 */
export function HeroInicio({ nombre, novedades, fiestas, respaldo }: { nombre: string; novedades: Novedad[]; fiestas: string[]; respaldo: string }) {
  const hoy = useHoy(respaldo);
  const lit = diaLiturgico(hoy.date);
  const tono = TONO_LITURGICO[lit.color];
  const frase = fraseDelDia(hoy.date);
  const proxima = proximaCelebracion(hoy.date);
  const cultos = cultosDelDia(hoy.date);
  const img = lit.imagen && fiestas.find((f) => f.startsWith(`${lit.imagen}.`));
  const todas: Novedad[] = [
    ...novedades,
    { titulo: cultos.length ? cultos.map((c) => c.tipo.toLowerCase()).join(" y ") + " en la capilla" : "hoy no hay misa en la casa", valor: cultos.length ? horaLegible(cultos[0].inicio) : "—", href: "/casa#horarios", icono: <Church size={18} /> },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#5b0d14_0%,#8a1b24_55%,#a3222b_100%)] text-white">
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[44%] md:block">
        <Image src={img ? `/marca/fiestas/${img}` : "/marca/cristo.jpg"} alt="" fill sizes="44vw" priority className="object-cover object-[50%_20%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#8a1b24_0%,rgba(138,27,36,0.55)_35%,rgba(138,27,36,0)_70%)]" />
      </div>
      <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-8 md:max-w-[60%]">
        <div className="flex items-center gap-3">
          <Image src="/marca/rc-escudo.png" alt="Regnum Christi" width={52} height={52} priority className="size-12 rounded-full ring-2 ring-white/30 sm:size-13" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-xs">Regnum Christi · Jóvenes Barquisimeto</span>
            <time dateTime={hoy.fecha} className="text-sm text-white/85 first-letter:uppercase">{fechaLarga(hoy.date)}</time>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-white/90">{saludoPorHora(hoy.hora)}, {nombre}</span>
          <h1 className="font-serif text-[2.75rem] font-bold italic leading-[1.05] tracking-tight sm:text-6xl">¡Venga tu Reino!</h1>
        </div>
        <div className="flex flex-col gap-2">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span aria-hidden className="size-3 rounded-full ring-2 ring-white/60" style={{ background: tono.fondo }} />
            <strong>{lit.nombre}</strong>
            <span className="basis-full text-white/75 sm:basis-auto"><span className="hidden sm:inline">· </span>{RANGO[lit.rango]} · {lit.tiempo} · color {tono.nombre.toLowerCase()}</span>
          </span>
          <blockquote className="border-l-2 border-[var(--gold)] pl-3 font-serif text-base italic text-white/95 sm:text-lg">
            «{frase.texto}» <cite className="not-italic text-sm text-white/70">{frase.cita}</cite>
          </blockquote>
          {proxima ? <span className="text-xs text-white/75">Próxima celebración: {proxima.nombre}, {fechaLarga(`${proxima.fecha}T12:00:00`)}</span> : null}
        </div>
      </div>
      <div className="relative z-10 border-t border-white/15 bg-black/20 px-3 py-3 backdrop-blur-sm sm:px-6">
        <h2 className="sr-only">Novedades de hoy</h2>
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          {todas.map((n, i) => (
            <li key={n.titulo} className={i === todas.length - 1 && todas.length % 2 ? "col-span-2 lg:col-span-1" : undefined}>
              <Link href={n.href} className="flex h-full items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-white no-underline transition-colors hover:bg-white/20">
                <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">{n.icono}</span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <strong className="text-lg tabular-nums">{n.valor}</strong>
                  <span className="line-clamp-2 text-xs text-white/80">{n.titulo}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

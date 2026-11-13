"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { TONO_LITURGICO, diaLiturgico, fraseDelDia, proximaCelebracion } from "@/lib/domain/liturgia";
import { fechaLarga } from "@/lib/domain/fechas";
import { saludoPorHora, useHoy } from "./hoy";

/** Carta de inicio (como la del módulo Inicio) en versión compacta: saludo, día litúrgico y frase del día real. */
export function CartaInicio({ nombre, subtitulo, children }: { nombre: string; subtitulo?: string; children?: ReactNode }) {
  const { date: hoy, hora } = useHoy("2026-11-01T09");
  const saludo = `${saludoPorHora(hora)}, ${nombre}`;
  const lit = diaLiturgico(hoy);
  const tono = TONO_LITURGICO[lit.color];
  const frase = fraseDelDia(hoy);
  const prox = proximaCelebracion(hoy);
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#5b0d14_0%,#8a1b24_55%,#a3222b_100%)] text-white">
      <div aria-hidden className="absolute inset-y-0 right-0 w-[38%] opacity-40 sm:opacity-100">
        <Image src="/marca/cristo.jpg" alt="" fill sizes="38vw" className="object-cover object-[50%_20%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#8a1b24_0%,rgba(138,27,36,0.55)_40%,rgba(138,27,36,0)_80%)]" />
      </div>
      <div className="relative z-10 flex flex-col gap-4 p-5 sm:max-w-[68%] sm:p-7">
        <div className="flex items-center gap-3">
          <Image src="/marca/rc-escudo.png" alt="Regnum Christi" width={44} height={44} className="size-11 rounded-full ring-2 ring-white/30" />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">Regnum Christi · Jóvenes Barquisimeto</span>
            <span className="text-sm text-white/85 first-letter:uppercase">{fechaLarga(hoy)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-white/90">{saludo}</span>
          <h1 className="font-serif text-4xl font-bold italic leading-[1.05] tracking-tight sm:text-5xl">¡Venga tu Reino!</h1>
          {subtitulo ? <span className="text-sm text-white/80">{subtitulo}</span> : null}
        </div>
        <span className="flex flex-wrap items-center gap-2 text-sm">
          <span aria-hidden className="size-3 rounded-full ring-2 ring-white/60" style={{ background: tono.fondo }} />
          <strong>{lit.nombre}</strong><span className="text-white/75">· {lit.tiempo}</span>
        </span>
        <blockquote className="border-l-2 border-[var(--gold)] pl-3 font-serif text-base italic text-white/95">
          «{frase.texto}» <cite className="not-italic text-sm text-white/70">{frase.cita}</cite>
        </blockquote>
        {prox ? <span className="text-xs text-white/75">Próxima celebración: {prox.nombre}, {fechaLarga(`${prox.fecha}T12:00:00`)}</span> : null}
        {children}
      </div>
    </section>
  );
}

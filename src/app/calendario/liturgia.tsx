"use client";

import { Church } from "lucide-react";
import { Card } from "@/components/ui";
import { useHoy } from "@/components/hoy";
import { diasEntre, fechaLarga } from "@/lib/domain/fechas";
import { TONO_LITURGICO, diaLiturgico, proximaCelebracion } from "@/lib/domain/liturgia";

/** Liturgia del día real y la próxima celebración. */
export function LiturgiaHoy() {
  const { date } = useHoy("2026-11-01T09");
  const sig = proximaCelebracion(date);
  return (
    <>
      {[{ t: "Hoy en la liturgia", d: diaLiturgico(date) }, ...(sig ? [{ t: `Próxima celebración · en ${diasEntre(date, sig.fecha)} días`, d: sig }] : [])].map(({ t, d }) => (
        <Card key={t} title={t} action={<Church size={20} aria-hidden className="text-accent" />}>
          <div className="flex items-center gap-3">
            <span aria-hidden className="size-10 shrink-0 rounded-full ring-2 ring-border" style={{ background: TONO_LITURGICO[d.color].fondo }} />
            <div className="flex flex-col">
              <strong className="text-base">{d.nombre}</strong>
              <span className="text-xs text-muted first-letter:uppercase">{fechaLarga(`${d.fecha}T12:00:00`)} · {d.tiempo} · color {TONO_LITURGICO[d.color].nombre.toLowerCase()}{d.rc ? " · fiesta RC" : ""}</span>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

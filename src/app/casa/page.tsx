import { Church, MapPin } from "lucide-react";
import { AvisoSimulado, Card, PageHeader, LinkButton } from "@/components/ui";
import { HORA_EUCARISTICA_LOCALIDAD, HORARIO_SEMANAL, LUGAR_CASA, finCulto, horaLegible } from "@/lib/domain/culto";
import { db } from "@/lib/data/repo";
import * as casa from "@/lib/data/casa";
import { CAMARAS } from "@/lib/data/camaras";
import { PanelCasa } from "./panel";

export const metadata = { title: "La casa" };

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function Casa() {
  return (
    <>
      <PageHeader title="La casa" description="Toca un espacio del plano para ver su estado, sus reservas y sus cámaras. La casa la usan Jóvenes, Señores y Jóvenes Señores." actions={<LinkButton href="/reservar" variant="secondary">Formulario público de reservas</LinkButton>} />
      <AvisoSimulado />
      <PanelCasa espacios={db.espacios} reservas={db.reservas} directores={db.DIRECTORES_SECCION} casa={casa} camaras={CAMARAS} ahora="2026-11-01T09:00:00" />
      <Card id="horarios" title="Misas y adoración en la capilla" subtitle="Estos horarios bloquean la capilla en las reservas. La misa dura unos 45 minutos." action={<Church size={20} aria-hidden className="text-accent" />}>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((d) => (
            <li key={d} className="flex flex-col gap-1.5 rounded-xl bg-surface-2 p-3">
              <strong className="text-sm">{DIAS[d]}</strong>
              {HORARIO_SEMANAL[d].map((c) => (
                <span key={c.tipo + c.inicio} className="flex items-baseline justify-between gap-2 text-sm">
                  <span>{c.tipo}</span><span className="tabular-nums text-ink-2">{horaLegible(c.inicio)} a {horaLegible(finCulto(c))}</span>
                </span>
              ))}
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-2">El primer jueves de cada mes no hay hora eucarística en la casa: se va a la {HORA_EUCARISTICA_LOCALIDAD.tipo.toLowerCase()}, de {horaLegible(HORA_EUCARISTICA_LOCALIDAD.inicio)} a {horaLegible(finCulto(HORA_EUCARISTICA_LOCALIDAD))}.</p>
        <p className="flex items-center gap-1.5 text-xs text-muted"><MapPin size={14} aria-hidden />{LUGAR_CASA}</p>
      </Card>
    </>
  );
}

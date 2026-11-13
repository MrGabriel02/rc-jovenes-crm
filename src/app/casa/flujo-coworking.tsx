import { Fragment } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowRight, Bot, CornerDownLeft, RefreshCw } from "lucide-react";

type Actor = "Interesado" | "Encargado del coworking" | "Miembro" | "Plataforma";
interface Paso { n: number; titulo: string; actor: Actor; hace: string[]; auto?: string; decision?: { opcion: string; destino: string; tono: "good" | "accent" | "neutral" }[] }

const ACTOR: Record<Actor, string> = {
  Interesado: "bg-[color-mix(in_oklab,var(--series-2)_16%,var(--surface))] text-[var(--series-2)]",
  "Encargado del coworking": "bg-accent-soft text-accent",
  Miembro: "bg-[color-mix(in_oklab,var(--good-ink)_14%,var(--surface))] text-good-ink",
  Plataforma: "bg-surface-2 text-ink-2 ring-1 ring-border",
};

/** Las dos filas del flujo: de interesado a decisión, y de pago a renovación. */
const FILAS: Paso[][] = [
  [
    { n: 1, titulo: "Llega un interesado", actor: "Interesado", hace: ["Escribe por Instagram o WhatsApp, lo refiere alguien o escanea el QR de la casa", "Deja nombre, teléfono y qué necesita"], auto: "Lo crea como “Contacto” en el CRM del coworking" },
    { n: 2, titulo: "Contacto y visita", actor: "Encargado del coworking", hace: ["Le escribe en menos de 24 h", "Agenda una visita guiada por la casa"], auto: "Recuerda al encargado si pasan 3 días sin respuesta" },
    { n: 3, titulo: "Día de prueba", actor: "Interesado", hace: ["Usa el coworking un día con pase de prueba", "Al salir dice qué le pareció"], auto: "Registra la visita y pasa la tarjeta a “Prueba”" },
    {
      n: 4, titulo: "¿Se queda?", actor: "Encargado del coworking", hace: ["Conversa con el interesado y anota su decisión"],
      decision: [
        { opcion: "Membresía mensual · $50", destino: "Sigue al paso 5", tono: "good" },
        { opcion: "Pase por día", destino: "Paga el día y usa el paso 6", tono: "accent" },
        { opcion: "No concretó", destino: "Se guarda el motivo y se le escribe en 30 días", tono: "neutral" },
      ],
    },
  ],
  [
    { n: 5, titulo: "Pago y alta", actor: "Miembro", hace: ["Paga en Bs o $ (pago móvil, Zelle o efectivo)", "Sube el comprobante"], auto: "El encargado confirma; queda como miembro y el ingreso entra a la economía de la casa a la tasa BCV" },
    { n: 6, titulo: "Uso diario", actor: "Miembro", hace: ["Lunes a viernes, 7:00 a.m. a 6:00 p.m.", "Reserva la sala de reuniones si la necesita", "Puede usar el cafetín"], auto: "Revisa que la reserva no choque con la misa ni con otra actividad" },
    { n: 7, titulo: "Renovación", actor: "Plataforma", hace: ["Avisa al miembro 5 días antes de que venza", "Si paga, vuelve al uso diario por otro mes", "Si no paga en 5 días, queda pendiente y se avisa al encargado"] },
  ],
];

function Tarjeta({ p }: { p: Paso }) {
  return (
    <li className={clsx("flex flex-1 flex-col gap-2 rounded-2xl border p-3", p.decision ? "border-2 border-dashed border-brand/60 bg-surface" : "border-border bg-surface")}>
      <div className="flex items-center gap-2">
        <span className={clsx("flex size-8 shrink-0 items-center justify-center text-sm font-extrabold text-white", p.decision ? "rotate-45 rounded-md bg-[var(--gold)]" : "rounded-full bg-brand")}><span className={p.decision ? "-rotate-45" : undefined}>{p.n}</span></span>
        <strong className="text-sm leading-tight">{p.titulo}</strong>
      </div>
      <span className={clsx("self-start rounded-full px-2 py-0.5 text-[11px] font-bold", ACTOR[p.actor])}>{p.actor}</span>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-ink-2">{p.hace.map((h) => <li key={h}>{h}</li>)}</ul>
      {p.decision ? (
        <ul className="flex flex-col gap-1.5">
          {p.decision.map((d) => (
            <li key={d.opcion} className={clsx("rounded-lg px-2 py-1.5 text-xs", d.tono === "good" ? "bg-[color-mix(in_oklab,var(--good-ink)_12%,var(--surface))]" : d.tono === "accent" ? "bg-accent-soft" : "bg-surface-2")}>
              <strong className="block">{d.opcion}</strong><span className="text-ink-2">{d.destino}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {p.auto ? <p className="mt-auto flex items-start gap-1.5 rounded-lg bg-surface-2 p-2 text-[11px] text-ink-2"><Bot size={14} aria-hidden className="mt-px shrink-0 text-accent" />{p.auto}</p> : null}
    </li>
  );
}

const Flecha = () => (
  <li aria-hidden className="flex items-center justify-center text-muted">
    <ArrowDown size={20} className="md:hidden" /><ArrowRight size={20} className="hidden md:block" />
  </li>
);

/** Diagrama del flujo de trabajo del coworking, de que llega un interesado a la renovación mensual. */
export function FlujoCoworking() {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2 text-[11px] font-bold" aria-label="Quién hace cada paso">
        {(Object.keys(ACTOR) as Actor[]).map((a) => <li key={a} className={clsx("rounded-full px-2 py-0.5", ACTOR[a])}>{a}</li>)}
      </ul>
      {FILAS.map((fila, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <p className="flex items-center gap-2 text-xs font-semibold text-muted"><CornerDownLeft size={16} aria-hidden className="text-accent" />Si elige membresía, sigue con el pago</p>
          ) : null}
          <ol className="flex flex-col gap-2 md:flex-row">
            {fila.map((p, j) => (
              <Fragment key={p.n}>
                {j > 0 ? <Flecha /> : null}
                <Tarjeta p={p} />
              </Fragment>
            ))}
          </ol>
        </Fragment>
      ))}
      <p className="flex items-center gap-2 text-xs text-ink-2"><RefreshCw size={14} aria-hidden className="text-accent" />Los pasos 6 y 7 se repiten cada mes mientras el miembro renueve. El precio del pase por día está por definir.</p>
    </div>
  );
}

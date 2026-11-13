import { AvisoSimulado, Card, Grid, PageHeader, LinkButton } from "@/components/ui";
import { db, apostolado, formadores, nombreCompleto } from "@/lib/data/repo";
import { iso } from "@/lib/domain/fechas";
import { CuentaRegresiva } from "@/components/cuenta-regresiva";
import { LiturgiaHoy } from "./liturgia";
import { diaLiturgico } from "@/lib/domain/liturgia";
import { cultosDelDia } from "@/lib/domain/culto";
import { CalendarioMes, type EventoCal } from "./mes";
import { NuevaActividad } from "./nueva";

export const metadata = { title: "Calendario" };

const TIPO: Record<string, string> = {
  retiro_apostolado: "Retiro", retiro_seccion: "Retiro de sección", hora_eucaristica: "Hora eucarística", circulo_estudio: "Círculo de estudio",
  dia_apostolado: "Día de apostolado", charla_formacion: "Formación", vfc: "VFC", fin_semana_formadores: "Formadores", fin_semana_equipo: "Fin de semana de equipo",
};

const hhmm = (d: string) => d.slice(11, 16);

const DESDE = "2026-01-01", HASTA = "2027-03-31";

function eventosEntre(desde: string, hasta: string): EventoCal[] {
  const ev: EventoCal[] = [];
  for (let d = new Date(`${desde}T12:00:00`); iso(d) <= hasta; d.setDate(d.getDate() + 1)) {
    const f = iso(d);
    for (const a of db.actividades.filter((x) => x.inicio.slice(0, 10) <= f && x.fin.slice(0, 10) >= f)) {
      ev.push({ id: `${a.id}-${f}`, fecha: f, hora: a.inicio.slice(0, 10) === f ? hhmm(a.inicio) : undefined, titulo: a.nombre, categoria: "actividad", tipo: TIPO[a.tipo] });
    }
    for (const c of cultosDelDia(f).filter((x) => x.tipo !== "Hora eucarística de la localidad")) ev.push({ id: `culto-${f}-${c.inicio}`, fecha: f, hora: c.inicio, titulo: c.tipo, categoria: "culto", tipo: c.tipo });
    const l = diaLiturgico(f);
    if (l.rango === "solemnidad" || l.rango === "fiesta" || l.rc) ev.push({ id: `lit-${f}`, fecha: f, titulo: l.nombre, categoria: "liturgia", tipo: l.rango });
  }
  for (const r of db.reservas.filter((x) => !x.rechazadaPor)) {
    const esp = db.espacios.find((e) => e.id === r.espacioId)?.nombre ?? "";
    ev.push({ id: `res-${r.id}`, fecha: r.inicio.slice(0, 10), hora: hhmm(r.inicio), titulo: `${esp}: ${r.motivo}`, categoria: "reserva", tipo: "Reserva" });
  }
  return ev.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
}

const ENLAZADOS = [
  { nombre: "Calendario de la sección", detalle: "Actividades, retiros y encuentros", cuenta: "rcjovenesbqto@gmail.com" },
  { nombre: "Reservas de la casa", detalle: "Se llena solo al aprobar una reserva", cuenta: "Correo de reservas (por pasar al de la sección)" },
  { nombre: "Agendas de citas de dirección espiritual", detalle: "Una por cada uno de los 3 directores", cuenta: "Correo de cada director" },
  { nombre: "Calendarios de los apostolados", detalle: "Uno por apostolado, con sus reuniones y retiros", cuenta: "Gmail de cada apostolado" },
];

export default function Calendario() {

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Actividades de la sección y de los apostolados, reservas de la casa, misas y fiestas litúrgicas."
        actions={<><LinkButton href="#enlazados" variant="secondary">Ver calendarios enlazados</LinkButton><LinkButton href="#nueva">Añadir actividad</LinkButton></>}
      />
      <AvisoSimulado />
      <Grid min={300}>
        <LiturgiaHoy />
        <Card title="Hora eucarística de la localidad" subtitle="Todos los primeros jueves del mes">
          <p className="text-sm">De 7:30 a 8:30 p. m. Ese jueves no hay hora eucarística en la casa.</p>
        </Card>
      </Grid>
      <Card title="Calendario" subtitle="Toca un día para ver su semana">
        <CalendarioMes desde={DESDE} hasta={HASTA} eventos={eventosEntre(DESDE, HASTA)} tipos={[...new Set(Object.values(TIPO))]} />
      </Card>
      <Card title="Cuenta regresiva">
        <CuentaRegresiva items={db.actividades.map((a) => ({ id: a.id, nombre: a.nombre, inicio: a.inicio, detalle: a.lugar ?? undefined, etiqueta: TIPO[a.tipo], sub: apostolado(a.apostoladoId)?.nombre ?? "Sección" }))} />
      </Card>
      <Card id="enlazados" title="Calendarios enlazados" subtitle="Todo lo que se ve arriba sale de estos calendarios de Google. Se conectan con la cuenta de la plataforma.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {ENLAZADOS.map((c) => (
            <li key={c.nombre} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <span className="flex min-w-0 flex-1 flex-col"><strong className="text-sm">{c.nombre}</strong><span className="text-xs text-muted">{c.detalle} · {c.cuenta}</span></span>
              <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" className="shrink-0 text-xs font-bold">Abrir</a>
            </li>
          ))}
        </ul>
      </Card>
      <Card id="nueva" title="Añadir actividad" subtitle="Queda en el calendario de la sección y, si es en la capilla, se revisa que no choque con la misa o la adoración">
        <NuevaActividad
          tipos={Object.entries(TIPO).map(([id, nombre]) => ({ id, nombre }))}
          apostolados={db.apostolados.map((a) => ({ id: a.id, nombre: a.nombre }))}
          espacios={db.espacios.map((e) => ({ id: e.id, nombre: e.nombre }))}
          personas={formadores().map((f) => ({ id: f.persona.id, nombre: nombreCompleto(f.persona) }))}
          directores={db.apostolados.flatMap((a) => { const p = db.personas.find((x) => x.id === a.directorId); return p ? [{ id: p.id, nombre: `${nombreCompleto(p)} (${a.nombre})` }] : []; })}
        />
      </Card>
    </>
  );
}

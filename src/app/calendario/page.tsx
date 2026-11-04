import { Church } from "lucide-react";
import { AvisoSimulado, Badge, Card, Grid, PageHeader, LinkButton } from "@/components/ui";
import { db, apostolado } from "@/lib/data/repo";
import { HOY, diasEntre, fechaLarga, iso } from "@/lib/domain/fechas";
import { TONO_LITURGICO, diaLiturgico, proximaCelebracion } from "@/lib/domain/liturgia";
import { cultosDelDia } from "@/lib/domain/culto";
import { CalendarioMes, type EventoCal } from "./mes";

export const metadata = { title: "Calendario" };

const TIPO: Record<string, string> = {
  retiro_apostolado: "Retiro", retiro_seccion: "Retiro de sección", hora_eucaristica: "Hora eucarística", circulo_estudio: "Círculo de estudio",
  dia_apostolado: "Día de apostolado", charla_formacion: "Formación", vfc: "VFC", fin_semana_formadores: "Formadores", fin_semana_equipo: "Fin de semana de equipo",
};

const hhmm = (d: string) => d.slice(11, 16);

function eventosDelMes(anio: number, mes: number): EventoCal[] {
  const ev: EventoCal[] = [];
  const dias = new Date(anio, mes + 1, 0).getDate();
  for (let n = 1; n <= dias; n++) {
    const f = iso(new Date(anio, mes, n));
    for (const a of db.actividades.filter((x) => x.inicio.slice(0, 10) <= f && x.fin.slice(0, 10) >= f)) {
      ev.push({ id: `${a.id}-${f}`, fecha: f, hora: a.inicio.slice(0, 10) === f ? hhmm(a.inicio) : undefined, titulo: a.nombre, categoria: "actividad", tipo: TIPO[a.tipo] });
    }
    for (const c of cultosDelDia(f).filter((x) => x.tipo !== "Hora eucarística de la localidad")) ev.push({ id: `culto-${f}-${c.inicio}`, fecha: f, hora: c.inicio, titulo: c.tipo, categoria: "culto", tipo: c.tipo });
    const l = diaLiturgico(f);
    if (l.rango === "solemnidad" || l.rango === "fiesta" || l.rc) ev.push({ id: `lit-${f}`, fecha: f, titulo: l.nombre, categoria: "liturgia", tipo: l.rango });
  }
  for (const r of db.reservas.filter((x) => x.inicio.startsWith(`${anio}-${String(mes + 1).padStart(2, "0")}`) && !x.rechazadaPor)) {
    const esp = db.espacios.find((e) => e.id === r.espacioId)?.nombre ?? "";
    ev.push({ id: `res-${r.id}`, fecha: r.inicio.slice(0, 10), hora: hhmm(r.inicio), titulo: `${esp}: ${r.motivo}`, categoria: "reserva", tipo: "Reserva" });
  }
  return ev.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
}

export default function Calendario() {
  const anio = 2026, mes = 10; // noviembre (0-indexado)
  const proximas = db.actividades.filter((a) => diasEntre(HOY, a.inicio) >= 0).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const hoyLit = diaLiturgico(HOY);
  const sigLit = proximaCelebracion(HOY);

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Actividades de la sección y de los apostolados, reservas de la casa, misas y fiestas litúrgicas."
        actions={<><LinkButton href="#" variant="secondary">Ver calendarios enlazados</LinkButton><LinkButton href="#">Añadir actividad</LinkButton></>}
      />
      <AvisoSimulado />
      <Grid min={300}>
        {[{ t: "Hoy en la liturgia", d: hoyLit }, ...(sigLit ? [{ t: `Próxima celebración · en ${diasEntre(HOY, sigLit.fecha)} días`, d: sigLit }] : [])].map(({ t, d }) => (
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
        <Card title="Hora eucarística de la localidad" subtitle="Todos los primeros jueves del mes">
          <p className="text-sm">De 7:30 a 8:30 p. m. Ese jueves no hay hora eucarística en la casa.</p>
        </Card>
      </Grid>
      <Card title="Noviembre 2026">
        <CalendarioMes anio={anio} mes={mes} hoy={iso(HOY)} eventos={eventosDelMes(anio, mes)} tipos={[...new Set(Object.values(TIPO))]} />
      </Card>
      <Card title="Cuenta regresiva">
        <ul className="flex flex-col">
          {proximas.map((a) => {
            const f = diasEntre(HOY, a.inicio);
            return (
              <li key={a.id} className="flex items-center gap-4 border-b border-border py-2.5 last:border-0">
                <div className="flex w-16 flex-col items-center"><span className="text-2xl font-extrabold text-accent">{f}</span><span className="text-[11px] text-muted">días</span></div>
                <div className="flex flex-1 flex-col"><strong className="text-sm">{a.nombre}</strong><span className="text-xs text-muted">{fechaLarga(a.inicio)} · {a.lugar}</span></div>
                <div className="flex flex-col items-end gap-1"><Badge>{TIPO[a.tipo]}</Badge><span className="text-[11px] text-muted">{apostolado(a.apostoladoId)?.nombre ?? "Sección"}</span></div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

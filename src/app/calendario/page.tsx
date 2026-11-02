import { AvisoSimulado, Badge, Card, Grid, PageHeader, LinkButton } from "@/components/ui";
import { db, apostolado } from "@/lib/data/repo";
import { HOY, diasEntre, fechaLarga, iso } from "@/lib/domain/fechas";

export const metadata = { title: "Calendario" };

const TIPO: Record<string, string> = {
  retiro_apostolado: "Retiro", retiro_seccion: "Retiro de sección", hora_eucaristica: "Hora eucarística", circulo_estudio: "Círculo de estudio",
  dia_apostolado: "Día de apostolado", charla_formacion: "Formación", vfc: "VFC", fin_semana_formadores: "Formadores", fin_semana_equipo: "Fin de semana de equipo",
};

export default function Calendario() {
  const anio = 2026, mes = 10; // noviembre (0-indexado)
  const primero = new Date(anio, mes, 1);
  const offset = (primero.getDay() + 6) % 7; // semana inicia lunes
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const celdas = Array.from({ length: Math.ceil((offset + diasMes) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= diasMes ? new Date(anio, mes, d) : null;
  });
  const enDia = (d: Date) => db.actividades.filter((a) => a.inicio.slice(0, 10) <= iso(d) && a.fin.slice(0, 10) >= iso(d));
  const proximas = db.actividades.filter((a) => diasEntre(HOY, a.inicio) >= 0).sort((a, b) => a.inicio.localeCompare(b.inicio));

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Actividades de la sección y de los apostolados. Lo editan el director de sección y quien fija las fechas."
        actions={<><LinkButton href="#" variant="secondary">Ver calendarios enlazados</LinkButton><LinkButton href="#">Nueva actividad</LinkButton></>}
      />
      <AvisoSimulado />
      <Grid min={420}>
        <Card title="Noviembre 2026">
          <div className="overflow-x-auto">
            <div className="grid min-w-[560px] grid-cols-7 gap-1 text-xs">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => <div key={d} className="px-1 py-1 font-bold text-muted">{d}</div>)}
              {celdas.map((d, i) => (
                <div key={i} className={`min-h-20 rounded-lg border p-1.5 ${d ? "border-border bg-surface" : "border-transparent"} ${d && iso(d) === iso(HOY) ? "ring-2 ring-brand" : ""}`}>
                  {d ? (
                    <>
                      <span className="font-bold">{d.getDate()}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        {enDia(d).map((a) => <span key={a.id} className="truncate rounded bg-accent-soft px-1 py-0.5 font-semibold text-accent" title={a.nombre}>{a.nombre}</span>)}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
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
      </Grid>
    </>
  );
}

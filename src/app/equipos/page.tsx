import Link from "next/link";
import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader, LinkButton } from "@/components/ui";
import { alertasFaltas, asistenciaPorEquipo, db, nombreCompleto, persona } from "@/lib/data/repo";

export const metadata = { title: "Equipos de reino" };

export default function Equipos() {
  const asis = asistenciaPorEquipo();
  const alertas = alertasFaltas();
  return (
    <>
      <PageHeader title="Equipos de reino" description="Encuentros semanales: Evangelio, meditación, caso de vida y repaso de compromisos. Solo los encuentros cuentan para las faltas." actions={<LinkButton href="#">Nuevo equipo</LinkButton>} />
      <AvisoSimulado />
      <Grid min={200}>
        <Kpi label="Equipos activos" value={db.equipos.length} />
        <Kpi label="Integrantes" value={db.equipos.reduce((a, e) => a + e.miembros.length, 0)} />
        <Kpi label="Con 2 o 3 faltas seguidas" value={alertas.filter((a) => a.nivel === "responsable").length} note="Avisado el responsable" />
        <Kpi label="Con 4 faltas o más" value={alertas.filter((a) => a.nivel === "crecimiento").length} tone="warn" note="Avisado crecimiento" />
      </Grid>
      <Grid min={300}>
        {db.equipos.map((e) => {
          const a = asis.find((x) => x.id === e.id)!;
          const al = alertas.filter((x) => x.equipo.id === e.id);
          return (
            <Card key={e.id} title={`Equipo ${e.nombre}`} subtitle={`Responsable: ${nombreCompleto(persona(e.responsableId))}`} action={al.length ? <Badge tone="warn">{al.length} alerta{al.length > 1 ? "s" : ""}</Badge> : null}>
              <div className="flex items-end justify-between">
                <div className="flex flex-col"><span className="text-3xl font-extrabold">{a.asistencia} %</span><span className="text-xs text-muted">asistencia en octubre</span></div>
                <span className="text-sm text-muted">{e.miembros.length} integrantes</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-2"><div className="h-2.5 rounded-full bg-accent" style={{ width: `${a.asistencia}%` }} /></div>
              <Link href={`/equipos/${e.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border text-sm font-bold no-underline">Pasar asistencia y ver integrantes</Link>
            </Card>
          );
        })}
      </Grid>
    </>
  );
}

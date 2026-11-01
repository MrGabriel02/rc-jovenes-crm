import { AvisoSimulado, Badge, Card, Grid, PageHeader } from "@/components/ui";
import { BarrasHorizontales } from "@/components/charts";
import { db, economiaPorArea, nombreCompleto, persona } from "@/lib/data/repo";
import { usd } from "@/lib/domain/economia";

export const metadata = { title: "Apostolados" };

export default function Apostolados() {
  const eco = economiaPorArea();
  const servidores = db.apostolados.map((a) => {
    const acts = db.actividades.filter((x) => x.apostoladoId === a.id).map((x) => x.id);
    return { apostolado: a.nombre, servidores: new Set(db.participaciones.filter((p) => acts.includes(p.actividadId) && p.rol === "servidor").map((p) => p.personaId)).size };
  }).filter((x) => x.servidores > 0);

  return (
    <>
      <PageHeader title="Apostolados" description="Cada apostolado conserva su Gmail y sus Google Forms; aquí se conectan sus hojas de respuestas y se ve su gente y su economía." />
      <AvisoSimulado />
      <Grid min={300}>
        {db.apostolados.map((a) => {
          const e = eco.find((x) => x.areaId === a.id);
          const acts = db.actividades.filter((x) => x.apostoladoId === a.id);
          const conectados = acts.filter((x) => x.formularioConectado).length;
          return (
            <Card key={a.id} title={a.nombre} subtitle={a.descripcion}>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-muted">Director</dt><dd>{a.directorId ? nombreCompleto(persona(a.directorId)) : "—"}</dd>
                <dt className="text-muted">Ecónomo</dt><dd>{a.economoId ? nombreCompleto(persona(a.economoId)) : "Sin asignar"}</dd>
                <dt className="text-muted">Actividades</dt><dd>{acts.length}</dd>
                <dt className="text-muted">Formularios</dt><dd>{conectados ? <Badge tone="good">{conectados} conectado{conectados > 1 ? "s" : ""}</Badge> : <Badge tone="warn">Sin conectar</Badge>}</dd>
                {e ? (<><dt className="text-muted">Resultado 6 meses</dt><dd className={e.ganancia >= 0 ? "font-bold text-good-ink" : "font-bold text-warn-ink"}>{usd(e.ganancia)}</dd></>) : null}
              </dl>
            </Card>
          );
        })}
      </Grid>
      <Grid min={360}>
        <Card title="Servidores por apostolado" subtitle="Personas distintas que sirvieron en 2026">
          <BarrasHorizontales data={servidores} x="apostolado" y="servidores" nombre="Servidores" />
        </Card>
        <Card title="Procedimientos de las cabezas de apostolado" subtitle="Del documento CRM, punto 4">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Proponer un nuevo integrante: la cabeza lo propone, el responsable de equipo de esa persona da su parecer y el director de sección aprueba.</li>
            <li>Después de cada actividad: la plataforma genera un enlace de evaluación de los responsables para enviarlo a los participantes de cada equipo.</li>
          </ol>
          <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3 text-sm">
            <strong>Propuestas pendientes</strong>
            <span>Search propone a {nombreCompleto(persona("p52"))} como responsable de logística · <Badge tone="warn">Espera parecer del responsable</Badge></span>
            <span>Juventud Misionera propone a {nombreCompleto(persona("p61"))} para el equipo organizador · <Badge tone="accent">Espera al director</Badge></span>
          </div>
        </Card>
      </Grid>
    </>
  );
}

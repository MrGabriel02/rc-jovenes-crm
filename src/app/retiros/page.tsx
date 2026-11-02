import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { Embudo } from "@/components/charts";
import { MENU_TRIDUO, TAREAS_TRIDUO, INVITADOS_TRIDUO } from "@/lib/data/retiros";
import { CalculadoraMenu } from "./calculadora";
import { db } from "@/lib/data/repo";
import { resultado, usd } from "@/lib/domain/economia";

export const metadata = { title: "Retiros" };

export default function Retiros() {
  const movTriduo = db.movimientos.filter((m) => m.areaId === "seccion" && m.fecha.slice(5, 7) === "07");
  const r = resultado(movTriduo);
  return (
    <>
      <PageHeader title="Retiros de la sección" description="Triduo (con asociaciones) y Ejercicios Espirituales: cada año se clona la plantilla del anterior con menú, tareas, materiales y presupuesto." />
      <AvisoSimulado />
      <div role="tablist" aria-label="Retiro" className="flex gap-1 self-start rounded-xl bg-surface-2 p-1 text-sm font-semibold">
        <span role="tab" aria-selected className="rounded-lg bg-surface px-3 py-2 shadow-sm">Triduo 2027</span>
        <span role="tab" aria-selected={false} className="px-3 py-2 text-muted">Ejercicios Espirituales 2027</span>
      </div>
      <Grid min={200}>
        <Kpi label="Inscritos" value={INVITADOS_TRIDUO.inscritos} note={`de ${INVITADOS_TRIDUO.propuestos} propuestos`} />
        <Kpi label="Resultado Triduo 2026" value={usd(r.ganancia)} note={`10 % a la localidad: ${usd(r.aporteLocalidad)}`} />
        <Kpi label="Tareas pendientes" value={TAREAS_TRIDUO.filter((t) => !t.hecha).length} />
        <Kpi label="Asociaciones y renovaciones" value={18} note="Registradas en el Triduo 2026" />
      </Grid>
      <CalculadoraMenu menu={MENU_TRIDUO} />
      <Grid min={360}>
        <Card title="Invitación previa" subtitle="Los responsables proponen nombres; crecimiento invita y da seguimiento">
          <Embudo etapas={[
            { etapa: "Propuestos por responsables", n: INVITADOS_TRIDUO.propuestos }, { etapa: "Invitados", n: INVITADOS_TRIDUO.invitados },
            { etapa: "Con cita o llamada", n: INVITADOS_TRIDUO.agendados }, { etapa: "Confirmados", n: INVITADOS_TRIDUO.confirmados }, { etapa: "Inscritos y con abono", n: INVITADOS_TRIDUO.inscritos },
          ]} />
        </Card>
        <Card title="Tareas del retiro" subtitle="Con fecha relativa al inicio del retiro">
          <ul className="flex flex-col gap-2 text-sm">
            {TAREAS_TRIDUO.map((t) => (
              <li key={t.tarea} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={t.hecha} aria-label={t.tarea} className="size-5 accent-brand" />
                <span className="flex-1">{t.tarea}</span>
                <Badge>{t.dia < 0 ? `D${t.dia}` : `D+${t.dia}`}</Badge>
                <span className="w-28 text-xs text-muted">{t.responsable}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
    </>
  );
}

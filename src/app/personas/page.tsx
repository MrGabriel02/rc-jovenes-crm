import { AvisoSimulado, Card, Grid, Kpi, PageHeader, LinkButton } from "@/components/ui";
import { TablaPersonas } from "./tabla";
import { personasConResumen } from "@/lib/data/repo";

export const metadata = { title: "Personas" };

export default function Personas() {
  const filas = personasConResumen();
  const haceVida = filas.filter((p) => p.estado === "hace_vida").length;
  return (
    <>
      <PageHeader
        title="Personas"
        description="Una ficha por persona, identificada por cédula. Cada formulario en el que aparece suma una actividad a su historial."
        actions={<><LinkButton href="#" variant="secondary">Revisar duplicados (3)</LinkButton><LinkButton href="#">Sincronizar formularios</LinkButton></>}
      />
      <AvisoSimulado />
      <Grid min={200}>
        <Kpi label="Personas en la base" value={filas.length} />
        <Kpi label="Hacen vida en la sección" value={haceVida} />
        <Kpi label="De paso" value={filas.length - haceVida} />
        <Kpi label="Sin cédula registrada" value={filas.filter((p) => !p.cedula).length} tone="warn" note="Pedirla en la próxima inscripción" />
      </Grid>
      <Card>
        <TablaPersonas filas={filas.map((p) => ({ id: p.id, nombre: p.nombreCompleto, cedula: p.cedula, zona: p.zona, estado: p.estado, actividades: p.actividades, servicios: p.servicios, equipo: p.equipo, ultimaDE: p.ultimaDE }))} />
      </Card>
    </>
  );
}

import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader, Table } from "@/components/ui";
import { Columnas, Linea } from "@/components/charts";
import { INSTAGRAM } from "@/lib/data/instagram";
import { PLANTILLAS_WHATSAPP } from "@/lib/domain/seguimiento";

export const metadata = { title: "Comunicaciones" };

export default function Comunicaciones() {
  const s = INSTAGRAM.seccion.mensual;
  const d = INSTAGRAM.director.mensual;
  const ultimo = s[s.length - 1];
  const comparativo = s.map((x, i) => ({ mes: x.mes, seccion: x.alcance, director: d[i].alcance }));
  return (
    <>
      <PageHeader title="Comunicaciones" description="Instagram de la sección y del director (Instagram Graph API, captura diaria) y mensajes de WhatsApp del CRM y las reservas." />
      <AvisoSimulado />
      <Grid min={200}>
        <Kpi label="Seguidores de la sección" value={ultimo.seguidores.toLocaleString("es-VE")} note={`+${ultimo.seguidores - s[s.length - 2].seguidores} en octubre`} tone="good" />
        <Kpi label="Seguidores del director" value={d[d.length - 1].seguidores.toLocaleString("es-VE")} />
        <Kpi label="Alcance de la sección (oct.)" value={ultimo.alcance.toLocaleString("es-VE")} />
        <Kpi label="Interacciones (oct.)" value={ultimo.interacciones.toLocaleString("es-VE")} />
      </Grid>
      <Grid min={360}>
        <Card title="Seguidores de la sección" subtitle={INSTAGRAM.seccion.usuario}>
          <Columnas data={s} x="mes" y="seguidores" nombre="Seguidores" />
        </Card>
        <Card title="Alcance mensual" subtitle="Sección y director">
          <Linea data={comparativo} x="mes" series={[{ clave: "seccion", nombre: "Sección", color: "var(--series-1)" }, { clave: "director", nombre: "Director", color: "var(--series-2)" }]} />
        </Card>
      </Grid>
      <Card title="Publicaciones con más alcance" subtitle="Octubre">
        <Table head={["Publicación", "Tipo", "Alcance", "Interacciones"]} minWidth={520}>
          {INSTAGRAM.publicaciones.map((p) => <tr key={p.titulo}><td className="font-semibold">{p.titulo}</td><td><Badge>{p.tipo}</Badge></td><td className="tabular-nums">{p.alcance.toLocaleString("es-VE")}</td><td className="tabular-nums">{p.interacciones}</td></tr>)}
        </Table>
      </Card>
      <Card title="Plantillas de WhatsApp" subtitle="Deben aprobarse en Meta antes de enviarse por la API. Sin API, se envían con un clic desde el teléfono del encargado.">
        <ul className="flex flex-col gap-2 text-sm">
          {(["ofrecer_de", "ofrecer_equipo", "rc_news", "continuidad"] as const).map((k) => (
            <li key={k} className="rounded-xl bg-surface-2 p-3"><Badge tone="accent">{k.replace("_", " ")}</Badge><p className="mt-2">{PLANTILLAS_WHATSAPP[k]("{nombre}", "{enlace}")}</p></li>
          ))}
          <li className="rounded-xl bg-surface-2 p-3"><Badge tone="accent">reserva aprobada</Badge><p className="mt-2">¡Hola {"{nombre}"}! Tu reserva de {"{espacio}"} para el {"{fecha}"} a las {"{hora}"} fue aprobada.</p></li>
        </ul>
      </Card>
    </>
  );
}

import QRCode from "qrcode";
import { AvisoSimulado, Alerta, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { Columnas, Linea } from "@/components/charts";
import { alertasDE, coberturaDE, coberturaPorMes, db, deporConfirmar, nombreCompleto, persona } from "@/lib/data/repo";
import { realizadas } from "@/lib/domain/direccion";
import { fechaCorta } from "@/lib/domain/fechas";
import { Confirmaciones } from "./confirmaciones";
import { AgendaDE } from "./agenda";
import { ACOMPANANTES, AGENDA_SEMANA, dirigidosPor } from "@/lib/data/de";
import { HOY } from "@/lib/domain/fechas";

export const metadata = { title: "Dirección espiritual" };

export default async function DireccionEspiritual() {
  const qrs = await Promise.all(ACOMPANANTES.map((d) => QRCode.toString(d.enlaceAgenda, { type: "svg", margin: 1, width: 132 })));
  const real = realizadas(db.sesionesDE);
  const porDirector = db.directores.map((d) => ({ director: d.nombre, realizadas: real.filter((s) => s.directorId === d.id && s.inicio >= "2026-08-01").length }));
  const pend = deporConfirmar();
  const al = alertasDE();
  const porMes = ["05", "06", "07", "08", "09", "10"].map((m) => ({ mes: new Intl.DateTimeFormat("es-VE", { month: "short" }).format(new Date(`2026-${m}-15T12:00:00`)), de: real.filter((s) => s.inicio.slice(5, 7) === m).length }));

  return (
    <>
      <PageHeader title="Dirección espiritual" description="Direcciones espirituales y diálogos apostólicos. Se leen solo las citas de la Agenda de citas de cada director; sus otros eventos se ignoran. Solo cuentan las que el director confirma." />
      <AvisoSimulado />
      <Grid min={200}>
        <Kpi label="Cobertura (60 días)" value={`${coberturaDE()} %`} note="De quienes hacen vida en equipos" />
        <Kpi label="DE realizadas en octubre" value={porMes[5].de} />
        <Kpi label="Por confirmar" value={pend.length} note="El director confirma con un toque" />
        <Kpi label="3 meses o más sin DE" value={al.filter((a) => a.nivel === "crecimiento").length} tone="warn" />
      </Grid>
      <AgendaDE acompanantes={ACOMPANANTES} citas={AGENDA_SEMANA} dirigidos={Object.fromEntries(ACOMPANANTES.map((a) => [a.id, dirigidosPor(a.id)]))} hoy={HOY.toISOString().slice(0, 10)} />
      <Confirmaciones sesiones={pend.map((s) => ({ id: s.id, persona: nombreCompleto(persona(s.personaId)), director: db.directores.find((d) => d.id === s.directorId)!.nombre, inicio: s.inicio }))} />
      <Card title="Enlaces y QR de las agendas" subtitle="Van en el mensaje del día 2 post retiro, en los grupos de equipo y en afiches de la casa">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}>
          {ACOMPANANTES.map((d, i) => (
            <div key={d.id} className="flex flex-col items-center gap-2 rounded-xl bg-surface-2 p-4 text-center">
              <div className="rounded-lg bg-white p-1" role="img" aria-label={`Código QR de la agenda de ${d.nombre}`} dangerouslySetInnerHTML={{ __html: qrs[i] }} />
              <strong className="text-sm">{d.nombre}</strong>
              <span className="text-xs text-muted">{d.tipo === "sacerdote" ? "Sacerdote" : "Laico formado"} · {d.modalidades.join(" y ")}</span>
              <a href={d.enlaceAgenda} className="break-all text-xs">{d.enlaceAgenda}</a>
            </div>
          ))}
        </div>
      </Card>
      <Grid min={340}>
        <Card title="Cobertura por mes" subtitle="% con DE en los 60 días previos">
          <Linea data={coberturaPorMes()} x="mes" sufijo=" %" series={[{ clave: "cobertura", nombre: "Cobertura", color: "var(--accent)" }]} />
        </Card>
        <Card title="DE realizadas por mes">
          <Columnas data={porMes} x="mes" y="de" nombre="DE realizadas" />
        </Card>
        <Card title="DE realizadas por director" subtitle="Desde agosto">
          <Columnas data={porDirector} x="director" y="realizadas" nombre="DE realizadas" color="var(--accent)" />
        </Card>
        <Card title="Alertas" subtitle="2 meses: aviso al director · 3 meses: aviso a crecimiento">
          <div className="flex flex-col gap-2">
            {al.slice(0, 6).map((a) => (
              <Alerta key={a.personaId} tone={a.nivel === "crecimiento" ? "warn" : "info"} tipo={a.nivel === "crecimiento" ? "3 meses" : "2 meses"} titulo={nombreCompleto(persona(a.personaId))} detalle={`Última DE el ${fechaCorta(a.ultima!.inicio)}`} />
            ))}
          </div>
        </Card>
      </Grid>
    </>
  );
}

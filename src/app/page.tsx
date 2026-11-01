import Link from "next/link";
import { AvisoSimulado, Alerta, Badge, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { BarrasHorizontales, Columnas, Embudo, IngresosGastos, Linea } from "@/components/charts";
import {
  alertasDE, alertasFaltas, asistenciaPorEquipo, coberturaPorMes, economiaPorArea, economiaPorMes, embudo,
  kpisInicio, nombreCompleto, participantesPorActividad, pendientesSeguimientoHoy, persona, proximasActividades,
} from "@/lib/data/repo";
import { fechaLarga, fechaCorta, HOY } from "@/lib/domain/fechas";
import { usd } from "@/lib/domain/economia";
import { INSTAGRAM } from "@/lib/data/instagram";

export default function Inicio() {
  const k = kpisInicio();
  const pasos = pendientesSeguimientoHoy();
  const af = alertasFaltas();
  const ad = alertasDE();
  const prox = proximasActividades(5);
  const eco = economiaPorArea("10").slice(0, 5);

  return (
    <>
      <PageHeader
        title="Buenos días, Jean"
        description={`${fechaLarga(HOY)} · ${pasos.reduce((a, p) => a + p.personas.length, 0)} mensajes de seguimiento y ${af.length + ad.length} alertas pendientes`}
      />
      <AvisoSimulado />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(190px, 100%), 1fr))" }}>
        <Kpi label="Jóvenes que hacen vida" value={k.haceVida} note={`de ${k.total} personas en la base`} />
        <Kpi label="De paso" value={k.dePaso} note="Asistieron a actividades" />
        <Kpi label="En seguimiento post retiro" value={k.enSeguimiento} note="God's Plan 23 y Search XXV" />
        <Kpi label="Cobertura de DE (60 días)" value={`${k.coberturaDE} %`} note={`${k.deRealizadasMes} DE realizadas en octubre`} tone={k.coberturaDE < 60 ? "warn" : "good"} />
        <Kpi label="Asistencia a encuentros" value={`${k.asistencia} %`} note={`${k.equipos} equipos de reino · octubre`} />
      </div>

      <Grid min={360}>
        <Card title="Hoy toca: seguimiento post retiro" action={<Link href="/seguimiento" className="text-sm font-semibold">Ver todo</Link>}>
          <ul className="flex flex-col gap-2">
            {pasos.slice(0, 5).map((p) => (
              <li key={`${p.actividad.id}-${p.clave}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3">
                <Badge tone="accent">D+{p.dia}</Badge>
                <div className="flex min-w-40 flex-1 flex-col">
                  <strong className="text-sm">{p.titulo}</strong>
                  <span className="text-xs text-muted">{p.actividad.nombre} · {p.personas.length} jóvenes</span>
                </div>
                <Link href={`/seguimiento?actividad=${p.actividad.id}`} className="inline-flex min-h-11 items-center rounded-xl bg-[#1e3a8a] px-4 text-sm font-bold text-white no-underline">Abrir</Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Alertas" subtitle="Faltas a encuentros y dirección espiritual">
          <div className="flex flex-col gap-2">
            {af.filter((a) => a.nivel === "crecimiento").map((a) => (
              <Alerta key={a.personaId} tipo={`${a.faltas} faltas`} titulo={nombreCompleto(persona(a.personaId))} detalle={`Equipo ${a.equipo.nombre} · avisar a crecimiento`} />
            ))}
            {ad.filter((a) => a.nivel === "crecimiento").slice(0, 2).map((a) => (
              <Alerta key={a.personaId} tipo="3 meses" titulo={`${nombreCompleto(persona(a.personaId))} sin DE`} detalle={`Última DE el ${fechaCorta(a.ultima!.inicio)} · proponer cambio de director`} />
            ))}
            {af.filter((a) => a.nivel === "responsable").slice(0, 2).map((a) => (
              <Alerta key={a.personaId} tone="info" tipo="2 faltas" titulo={nombreCompleto(persona(a.personaId))} detalle={`Equipo ${a.equipo.nombre} · el responsable ya fue notificado`} />
            ))}
          </div>
        </Card>
      </Grid>

      <h2 className="text-lg font-extrabold">Estadísticas</h2>
      <Grid min={340}>
        <Card title="Cobertura de dirección espiritual" subtitle="% de quienes hacen vida con DE en los últimos 60 días">
          <Linea data={coberturaPorMes()} x="mes" sufijo=" %" series={[{ clave: "cobertura", nombre: "Cobertura de DE", color: "var(--accent)" }]} />
        </Card>
        <Card title="Ingresos y gastos de la sección" subtitle="En dólares, a la tasa BCV de cada movimiento">
          <IngresosGastos data={economiaPorMes()} />
        </Card>
        <Card title="Participantes por actividad" subtitle="Personas inscritas en 2026">
          <BarrasHorizontales data={participantesPorActividad().slice(0, 7)} x="actividad" y="participantes" nombre="Participantes" />
        </Card>
        <Card title="Asistencia a encuentros por equipo" subtitle="Octubre">
          <BarrasHorizontales data={asistenciaPorEquipo().sort((a, b) => b.asistencia - a.asistencia)} x="equipo" y="asistencia" nombre="Asistencia" sufijo=" %" />
        </Card>
        <Card title="Después de God's Plan 23" subtitle="Avance del seguimiento post retiro">
          <Embudo etapas={embudo("gpr23")} />
        </Card>
        <Card title="Seguidores en Instagram" subtitle="Fin de cada mes">
          <Columnas data={INSTAGRAM.seccion.mensual} x="mes" y="seguidores" nombre="Seguidores de la sección" />
        </Card>
      </Grid>

      <Grid min={360}>
        <Card title="Próximas actividades" action={<Link href="/calendario" className="text-sm font-semibold">Calendario</Link>}>
          <ul className="flex flex-col">
            {prox.map((a) => (
              <li key={a.id} className="flex items-center gap-4 border-b border-border py-2.5 last:border-0">
                <div className="flex w-16 flex-col items-center">
                  <span className="text-2xl font-extrabold text-accent">{a.faltan}</span>
                  <span className="text-[11px] text-muted">{a.faltan === 1 ? "día" : "días"}</span>
                </div>
                <div className="flex flex-1 flex-col">
                  <strong className="text-sm">{a.nombre}</strong>
                  <span className="text-xs text-muted">{fechaLarga(a.inicio)} · {a.lugar}</span>
                </div>
                <Badge>{a.apostolado}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Economía de octubre" subtitle="Por apostolado o área, en dólares" action={<Link href="/economia" className="text-sm font-semibold">Informe</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-80 text-sm">
              <thead><tr className="text-left text-muted"><th className="py-2 font-semibold">Área</th><th className="py-2 text-right font-semibold">Ingresos</th><th className="py-2 text-right font-semibold">Gastos</th><th className="py-2 text-right font-semibold">Resultado</th></tr></thead>
              <tbody>
                {eco.map((e) => (
                  <tr key={e.areaId} className="border-t border-border">
                    <td className="py-2">{e.nombre}</td>
                    <td className="py-2 text-right">{usd(e.ingresosUSD)}</td>
                    <td className="py-2 text-right">{usd(e.gastosUSD)}</td>
                    <td className={`py-2 text-right font-bold ${e.ganancia >= 0 ? "text-good-ink" : "text-warn-ink"}`}>{usd(e.ganancia)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Grid>
    </>
  );
}

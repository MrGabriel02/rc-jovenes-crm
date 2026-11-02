import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Building2, CalendarCheck, Cctv, ClipboardCheck, HeartHandshake, Route, Users, UserRound, Wallet } from "lucide-react";
import { CAMARAS } from "@/lib/data/camaras";
import { estadoReserva } from "@/lib/domain/reservas";
import { AvisoSimulado, Alerta, Badge, Card, Kpi, LinkButton } from "@/components/ui";
import { BarrasHorizontales, Columnas, Embudo, IngresosGastos, Linea } from "@/components/charts";
import {
  alertasDE, alertasFaltas, asistenciaPorEquipo, coberturaPorMes, economiaPorArea, economiaPorMes, embudo,
  db, kpisInicio, nombreCompleto, participantesPorActividad, pendientesSeguimientoHoy, persona, proximasActividades,
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
  const eco = economiaPorArea("10");

  const cob = coberturaPorMes();
  const ecoMes = economiaPorMes();
  const ganancias = ecoMes.map((m) => m.ingresos - m.gastos);
  const ig = INSTAGRAM.seccion.mensual;
  const delta = (serie: number[], sufijo = "", masEsBueno = true) => {
    const [a, b] = serie.slice(-2);
    const d = b - a;
    return { valor: `${d >= 0 ? "+" : ""}${d.toLocaleString("es-VE")}${sufijo} vs. mes anterior`, sube: d >= 0, bueno: masEsBueno ? d >= 0 : d <= 0 };
  };
  const mensajes = pasos.reduce((a, p) => a + p.personas.length, 0);
  const reservasProximas = db.reservas
    .filter((r) => estadoReserva(r, db.DIRECTORES_SECCION) !== "rechazada" && r.inicio >= "2026-11-01")
    .sort((a, b) => a.inicio.localeCompare(b.inicio)).slice(0, 4);
  const pendientesAprobar = db.reservas.filter((r) => estadoReserva(r, db.DIRECTORES_SECCION) === "pendiente").length;
  const camOk = CAMARAS.filter((c) => c.estado === "en_linea").length;
  const span = (n: 4 | 5 | 6 | 7 | 8 | 12) => clsx({ 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8", 12: "lg:col-span-12" }[n]);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#5b0d14_0%,#8a1b24_55%,#a3222b_100%)] text-white">
        <div className="relative z-10 flex flex-col gap-5 p-6 sm:p-8 md:max-w-[62%]">
          <div className="flex items-center gap-3">
            <Image src="/marca/rc-escudo.png" alt="Regnum Christi" width={52} height={52} priority className="size-13 rounded-full ring-2 ring-white/30" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Regnum Christi · Jóvenes Barquisimeto</span>
              <span className="text-sm text-white/85">{fechaLarga(HOY)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Buenos días, Jean</h1>
            <p className="text-sm text-white/85 sm:text-base">Hoy hay {mensajes} mensajes de seguimiento, {af.length + ad.length} alertas y {pendientesAprobar} reservas por aprobar.</p>
            <p className="font-serif text-lg italic text-white/90">¡Venga tu Reino!</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/seguimiento" variant="light"><Route size={16} aria-hidden />Seguimiento</LinkButton>
            <LinkButton href="/equipos" variant="light"><ClipboardCheck size={16} aria-hidden />Pasar asistencia</LinkButton>
            <LinkButton href="/economia" variant="light"><Wallet size={16} aria-hidden />Registrar movimiento</LinkButton>
            <LinkButton href="/casa" variant="light"><Building2 size={16} aria-hidden />Reservas de la casa</LinkButton>
          </div>
        </div>
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[42%] md:block">
          <Image src="/marca/cristo.jpg" alt="" fill sizes="42vw" priority className="object-cover object-[50%_20%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#8a1b24_0%,rgba(138,27,36,0.55)_35%,rgba(138,27,36,0)_70%)]" />
        </div>
      </section>
      <AvisoSimulado />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
        <Kpi icon={<Users size={16} />} label="Jóvenes que hacen vida" value={k.haceVida} note={`de ${k.total} en la base`} />
        <Kpi icon={<UserRound size={16} />} label="De paso" value={k.dePaso} note="Asistieron a actividades" />
        <Kpi icon={<Route size={16} />} label="En seguimiento" value={k.enSeguimiento} note="God's Plan 23 y Search XXV" />
        <Kpi icon={<HeartHandshake size={16} />} label="Cobertura de DE" value={`${k.coberturaDE} %`} trend={cob.map((c) => c.cobertura)} delta={delta(cob.map((c) => c.cobertura), " pts")} />
        <Kpi icon={<CalendarCheck size={16} />} label="Asistencia a encuentros" value={`${k.asistencia} %`} note={`${k.equipos} equipos de reino`} />
        <Kpi icon={<Wallet size={16} />} label="Ganancia de octubre" value={usd(ganancias[ganancias.length - 1])} trend={ganancias} delta={delta(ganancias, " $")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className={span(8)} title="Ingresos y gastos de la sección" subtitle="En dólares, a la tasa BCV de cada movimiento" action={<Link href="/economia" className="text-sm font-semibold">Economía</Link>}>
          <IngresosGastos data={ecoMes} alto={300} />
        </Card>
        <Card className={span(4)} title="Alertas" subtitle="Faltas a encuentros y dirección espiritual">
          <div className="flex flex-col gap-2">
            {af.filter((a) => a.nivel === "crecimiento").map((a) => (
              <Alerta key={a.personaId} tipo={`${a.faltas} faltas`} titulo={nombreCompleto(persona(a.personaId))} detalle={`Equipo ${a.equipo.nombre} · avisar a crecimiento`} />
            ))}
            {ad.filter((a) => a.nivel === "crecimiento").slice(0, 2).map((a) => (
              <Alerta key={a.personaId} tipo="3 meses" titulo={`${nombreCompleto(persona(a.personaId))} sin DE`} detalle={`Última DE el ${fechaCorta(a.ultima!.inicio)}`} />
            ))}
            {af.filter((a) => a.nivel === "responsable").slice(0, 2).map((a) => (
              <Alerta key={a.personaId} tone="info" tipo="2 faltas" titulo={nombreCompleto(persona(a.personaId))} detalle={`Equipo ${a.equipo.nombre} · responsable notificado`} />
            ))}
          </div>
        </Card>

        <Card className={span(4)} title="Hoy toca" subtitle="Seguimiento post retiro" action={<Link href="/seguimiento" className="text-sm font-semibold">Ver todo</Link>}>
          <ul className="flex flex-col gap-2">
            {pasos.slice(0, 4).map((p) => (
              <li key={`${p.actividad.id}-${p.clave}`} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                <Badge tone="accent">D+{p.dia}</Badge>
                <div className="flex min-w-0 flex-1 flex-col">
                  <strong className="text-sm">{p.titulo}</strong>
                  <span className="truncate text-xs text-muted">{p.actividad.nombre} · {p.personas.length} jóvenes</span>
                </div>
                <Link href={`/seguimiento?actividad=${p.actividad.id}`} className="inline-flex min-h-10 items-center rounded-xl bg-brand px-3 text-sm font-bold text-white no-underline hover:bg-brand-hover">Abrir</Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card className={span(4)} title="Cobertura de dirección espiritual" subtitle="% de quienes hacen vida con DE en 60 días">
          <Linea data={cob} x="mes" sufijo=" %" series={[{ clave: "cobertura", nombre: "Cobertura de DE", color: "var(--series-1)" }]} />
        </Card>
        <Card className={span(4)} title="Después de God's Plan 23" subtitle="Avance del seguimiento post retiro">
          <Embudo etapas={embudo("gpr23")} />
        </Card>

        <Card className={span(6)} title="Participantes por actividad" subtitle="Personas inscritas en 2026">
          <BarrasHorizontales data={participantesPorActividad().slice(0, 8)} x="actividad" y="participantes" nombre="Participantes" color="var(--series-1)" />
        </Card>
        <Card className={span(6)} title="Asistencia a encuentros por equipo" subtitle="Octubre">
          <BarrasHorizontales data={asistenciaPorEquipo().sort((a, b) => b.asistencia - a.asistencia)} x="equipo" y="asistencia" nombre="Asistencia" sufijo=" %" color="var(--series-2)" />
        </Card>

        <Card className={span(4)} title="Próximas actividades" action={<Link href="/calendario" className="text-sm font-semibold">Calendario</Link>}>
          <ul className="flex flex-col">
            {prox.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
                <div className="flex w-12 flex-col items-center">
                  <span className="text-2xl font-extrabold text-accent tabular-nums">{a.faltan}</span>
                  <span className="text-[11px] text-muted">{a.faltan === 1 ? "día" : "días"}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <strong className="text-sm">{a.nombre}</strong>
                  <span className="truncate text-xs text-muted">{fechaLarga(a.inicio)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className={span(4)} title="La casa" subtitle="Próximas reservas y cámaras" action={<Link href="/casa" className="text-sm font-semibold">Ver mapa</Link>}>
          <ul className="flex flex-col gap-2">
            {reservasProximas.map((r) => {
              const pend = estadoReserva(r, db.DIRECTORES_SECCION) === "pendiente";
              return (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <span className="flex min-w-0 flex-col">
                    <strong className="text-sm">{db.espacios.find((e) => e.id === r.espacioId)?.nombre}</strong>
                    <span className="truncate text-xs text-muted">{new Date(r.inicio).toLocaleString("es-VE", { weekday: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · {r.solicitante}</span>
                  </span>
                  <Badge tone={pend ? "warn" : "good"}>{pend ? "Por aprobar" : "Aprobada"}</Badge>
                </li>
              );
            })}
          </ul>
          <Link href="/camaras" className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm text-ink no-underline hover:border-brand">
            <span className="flex items-center gap-2 font-semibold"><Cctv size={16} aria-hidden className="text-accent" />Cámaras</span>
            <span className={camOk === CAMARAS.length ? "text-good-ink" : "text-warn-ink"}>{camOk} de {CAMARAS.length} en línea</span>
          </Link>
        </Card>
        <Card className={span(4)} title="Seguidores en Instagram" subtitle="Cuenta de la sección, fin de cada mes" action={<Link href="/comunicaciones" className="text-sm font-semibold">Ver más</Link>}>
          <Columnas data={ig} x="mes" y="seguidores" nombre="Seguidores de la sección" color="var(--series-2)" />
        </Card>

        <Card className={span(12)} title="Economía de octubre" subtitle="Por apostolado o área, en dólares" action={<Link href="/economia" className="text-sm font-semibold">Informe</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-96 text-sm">
              <thead><tr className="text-left text-muted"><th className="py-2 font-semibold">Área</th><th className="py-2 text-right font-semibold">Ingresos</th><th className="py-2 text-right font-semibold">Gastos</th><th className="py-2 text-right font-semibold">Resultado</th><th className="py-2 text-right font-semibold">10 % localidad</th></tr></thead>
              <tbody>
                {eco.map((e) => (
                  <tr key={e.areaId} className="border-t border-border">
                    <td className="py-2">{db.apostolados.some((x) => x.id === e.areaId) ? <Link href={`/apostolados/${e.areaId}`}>{e.nombre}</Link> : e.nombre}</td>
                    <td className="py-2 text-right tabular-nums">{usd(e.ingresosUSD)}</td>
                    <td className="py-2 text-right tabular-nums">{usd(e.gastosUSD)}</td>
                    <td className={`py-2 text-right font-bold tabular-nums ${e.ganancia >= 0 ? "text-good-ink" : "text-warn-ink"}`}>{usd(e.ganancia)}</td>
                    <td className="py-2 text-right tabular-nums">{usd(e.aporteLocalidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

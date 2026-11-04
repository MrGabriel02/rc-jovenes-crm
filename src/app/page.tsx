import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { existsSync } from "node:fs";
import path from "node:path";
import { AlertTriangle, BellRing, Building2, Cake, CalendarCheck, Cctv, ChevronRight, Church, HeartHandshake, MessageCircle, Route, Users, UserRound, Wallet } from "lucide-react";
import { CAMARAS } from "@/lib/data/camaras";
import { estadoReserva } from "@/lib/domain/reservas";
import { AvisoSimulado, Alerta, Badge, Card, Kpi } from "@/components/ui";
import { BarrasHorizontales, Columnas, Embudo, IngresosGastos, Linea } from "@/components/charts";
import {
  alertasDE, alertasFaltas, asistenciaPorEquipo, coberturaPorMes, economiaPorArea, economiaPorMes, embudo,
  cumpleanosFormadores, db, kpisInicio, nombreCompleto, participantesPorActividad, pendientesSeguimientoHoy, persona, proximasActividades,
} from "@/lib/data/repo";
import { fechaLarga, fechaCorta, HOY } from "@/lib/domain/fechas";
import { usd } from "@/lib/domain/economia";
import { INSTAGRAM } from "@/lib/data/instagram";
import { REQUISITOS, avanceRequisito } from "@/lib/data/requisitos";
import { TONO_LITURGICO, diaLiturgico, fraseDelDia, proximaCelebracion } from "@/lib/domain/liturgia";
import { cultosDelDia, horaLegible } from "@/lib/domain/culto";

/** Imagen de la fiesta del día si existe en public/marca/fiestas; si no, la imagen de Cristo. */
function imagenDelDia(clave?: string) {
  if (clave) {
    for (const ext of ["jpg", "png", "webp"]) {
      const rel = `/marca/fiestas/${clave}.${ext}`;
      if (existsSync(path.join(process.cwd(), "public", rel))) return { src: rel, fiesta: true };
    }
  }
  return { src: "/marca/cristo.jpg", fiesta: false };
}

const RANGO: Record<string, string> = { solemnidad: "Solemnidad", fiesta: "Fiesta", memoria: "Memoria", domingo: "Domingo", feria: "Feria" };

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
  const lit = diaLiturgico(HOY);
  const tono = TONO_LITURGICO[lit.color];
  const frase = fraseDelDia(HOY);
  const proxima = proximaCelebracion(HOY);
  const img = imagenDelDia(lit.imagen);
  const cumples = cumpleanosFormadores(45);
  const cultos = cultosDelDia(HOY);
  const alertas = af.length + ad.length;
  const reqTotal = REQUISITOS.reduce((acc, r) => { const a = avanceRequisito(r); return { listos: acc.listos + a.listos, total: acc.total + a.total }; }, { listos: 0, total: 0 });
  const reqPct = { ...reqTotal, pct: Math.round((reqTotal.listos / reqTotal.total) * 100) };
  const novedades = [
    { titulo: "mensajes de seguimiento", valor: mensajes, href: "/seguimiento", icono: <MessageCircle size={18} /> },
    { titulo: "alertas de faltas y DE", valor: alertas, href: "#alertas", icono: <AlertTriangle size={18} /> },
    { titulo: "reservas por aprobar", valor: pendientesAprobar, href: "/casa", icono: <Building2 size={18} /> },
    { titulo: cumples[0] ? `cumpleaños; el próximo en ${cumples[0].faltan} días` : "cumpleaños próximos", valor: cumples.length, href: "#cumpleanos", icono: <Cake size={18} /> },
    { titulo: cultos.length ? cultos.map((c) => c.tipo.toLowerCase()).join(" y ") + " en la capilla" : "hoy no hay misa en la casa", valor: cultos.length ? horaLegible(cultos[0].inicio) : "—", href: "/casa#horarios", icono: <Church size={18} /> },
  ];
  const span = (n: 4 | 5 | 6 | 7 | 8 | 12) => clsx({ 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8", 12: "lg:col-span-12" }[n]);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#5b0d14_0%,#8a1b24_55%,#a3222b_100%)] text-white">
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[44%] md:block">
          <Image src={img.src} alt="" fill sizes="44vw" priority className="object-cover object-[50%_20%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#8a1b24_0%,rgba(138,27,36,0.55)_35%,rgba(138,27,36,0)_70%)]" />
        </div>
        {lit.rango === "solemnidad" || lit.rango === "fiesta" || lit.rc ? (
          <p className="absolute bottom-[132px] right-4 z-10 hidden max-w-[36%] rounded-full bg-black/45 px-3 py-1.5 text-right text-xs font-semibold backdrop-blur md:block">
            {RANGO[lit.rango]} de {lit.nombre}{img.fiesta ? "" : " · imagen de la fiesta por cargar"}
          </p>
        ) : null}
        <div className="relative z-10 flex flex-col gap-5 p-6 sm:p-8 md:max-w-[60%]">
          <div className="flex items-center gap-3">
            <Image src="/marca/rc-escudo.png" alt="Regnum Christi" width={52} height={52} priority className="size-13 rounded-full ring-2 ring-white/30" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Regnum Christi · Jóvenes Barquisimeto</span>
              <span className="text-sm text-white/85 first-letter:uppercase">{fechaLarga(HOY)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-white/90">Buenos días, Jean</span>
            <h1 className="font-serif text-5xl font-bold italic leading-[1.05] tracking-tight sm:text-6xl">¡Venga tu Reino!</h1>
          </div>
          <div className="flex flex-col gap-2">
            <span className="flex flex-wrap items-center gap-2 text-sm">
              <span aria-hidden className="size-3 rounded-full ring-2 ring-white/60" style={{ background: tono.fondo }} />
              <strong>{lit.nombre}</strong>
              <span className="text-white/75">· {RANGO[lit.rango]} · {lit.tiempo} · color {tono.nombre.toLowerCase()}</span>
            </span>
            <blockquote className="border-l-2 border-[var(--gold)] pl-3 font-serif text-base italic text-white/95 sm:text-lg">
              «{frase.texto}» <cite className="not-italic text-sm text-white/70">{frase.cita}</cite>
            </blockquote>
            {proxima ? <span className="text-xs text-white/75">Próxima celebración: {proxima.nombre}, {fechaLarga(`${proxima.fecha}T12:00:00`)}</span> : null}
          </div>
        </div>
        <div className="relative z-10 border-t border-white/15 bg-black/20 px-4 py-3 backdrop-blur-sm sm:px-6">
          <h2 className="sr-only">Novedades de hoy</h2>
          <ul className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            {novedades.map((n) => (
              <li key={n.titulo}>
                <Link href={n.href} className="flex h-full items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-white no-underline transition-colors hover:bg-white/20">
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">{n.icono}</span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <strong className="text-lg tabular-nums">{n.valor}</strong>
                    <span className="line-clamp-2 text-xs text-white/80">{n.titulo}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <AvisoSimulado />

      <section aria-labelledby="req-titulo" className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="req-titulo" className="text-base font-extrabold">Requisitos del CRM (P. Elías)</h2>
            <p className="text-xs text-muted">Avance de cada pedido del documento, para supervisar lo que falta</p>
          </div>
          <span className="text-sm font-semibold text-ink-2"><strong className="text-2xl font-extrabold text-ink tabular-nums">{reqPct.pct} %</strong> listo · {reqTotal.listos} de {reqTotal.total} partes</span>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {REQUISITOS.map((r) => {
            const av = avanceRequisito(r);
            const faltan = r.partes.filter((x) => x.estado !== "listo");
            return (
              <li key={r.n} className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
                <Link href={r.href} className="flex items-start justify-between gap-2 text-ink no-underline hover:text-accent">
                  <span className="text-sm font-bold"><span className="text-accent tabular-nums">{r.n}.</span> {r.titulo}</span>
                  <ChevronRight size={16} aria-hidden className="mt-0.5 shrink-0 text-muted" />
                </Link>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={av.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance del requisito ${r.n}`}>
                    <div className="h-full rounded-full bg-brand" style={{ width: `${av.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-ink-2">{av.listos}/{av.total}</span>
                </div>
                {faltan.length ? (
                  <ul className="flex flex-col gap-1 text-xs text-ink-2">
                    {faltan.map((x) => (
                      <li key={x.texto} className="flex items-start gap-1.5">
                        <span className="shrink-0"><Badge tone={x.estado === "en_curso" ? "accent" : "neutral"}>{x.estado === "en_curso" ? "En curso" : "Pendiente"}</Badge></span>
                        <span className="pt-0.5">{x.texto}</span>
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-xs text-good-ink">Completo</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
        <Kpi icon={<Users size={16} />} label="Jóvenes que hacen vida" value={k.haceVida} note={`de ${k.total} en la base`} />
        <Kpi icon={<UserRound size={16} />} label="Han pasado" value={k.dePaso} note="Asistieron a actividades" />
        <Kpi icon={<Route size={16} />} label="En seguimiento" value={k.enSeguimiento} note="God's Plan 23 y Search XXV" />
        <Kpi icon={<HeartHandshake size={16} />} label="Cobertura de DE" value={`${k.coberturaDE} %`} trend={cob.map((c) => c.cobertura)} delta={delta(cob.map((c) => c.cobertura), " pts")} />
        <Kpi icon={<CalendarCheck size={16} />} label="Asistencia a encuentros" value={`${k.asistencia} %`} note={`${k.equipos} equipos`} />
        <Kpi icon={<Wallet size={16} />} label="Ganancia de octubre" value={usd(ganancias[ganancias.length - 1])} trend={ganancias} delta={delta(ganancias, " $")} />
      </div>

      <section aria-labelledby="hoy-titulo" className="flex flex-col gap-4 rounded-2xl border-2 border-brand/40 bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="hoy-titulo" className="flex items-center gap-2 text-xl font-extrabold"><BellRing size={20} aria-hidden className="text-accent" />Hoy toca</h2>
            <p className="text-sm text-muted">Seguimiento post retiro: {mensajes} mensajes en {pasos.length} pasos</p>
          </div>
          <Link href="/seguimiento" className="text-sm font-semibold">Ver todo el seguimiento</Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pasos.slice(0, 8).map((p) => (
            <li key={`${p.actividad.id}-${p.clave}`} className="flex flex-col gap-3 rounded-xl bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="accent">D+{p.dia}</Badge>
                <span className="text-2xl font-extrabold tabular-nums">{p.personas.length}<span className="ml-1 text-xs font-semibold text-muted">jóvenes</span></span>
              </div>
              <div className="flex min-w-0 flex-col">
                <strong className="text-base leading-snug">{p.titulo}</strong>
                <span className="truncate text-xs text-muted">{p.actividad.nombre}</span>
              </div>
              <Link href={`/seguimiento?actividad=${p.actividad.id}`} className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-3 text-sm font-bold text-white no-underline hover:bg-brand-hover">Abrir y enviar</Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className={span(8)} title="Ingresos y gastos de la sección" subtitle="En dólares, a la tasa BCV de cada movimiento" action={<Link href="/economia" className="text-sm font-semibold">Economía</Link>}>
          <IngresosGastos data={ecoMes} alto={300} />
        </Card>
        <Card id="alertas" className={span(4)} title="Alertas" subtitle="Faltas a encuentros y dirección espiritual">
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

        <Card className={span(4)} title="Cobertura de dirección espiritual" subtitle="% de quienes hacen vida con DE en 60 días">
          <Linea data={cob} x="mes" sufijo=" %" series={[{ clave: "cobertura", nombre: "Cobertura de DE", color: "var(--series-1)" }]} />
        </Card>
        <Card className={span(4)} title="Después de God's Plan 23" subtitle="Avance del seguimiento post retiro">
          <Embudo etapas={embudo("gpr23")} />
        </Card>

        <Card id="cumpleanos" className={span(4)} title="Cumpleaños de formadores" subtitle="Próximos 45 días · responsables, directores y ecónomos">
          {cumples.length ? (
            <ul className="flex flex-col gap-2">
              {cumples.slice(0, 5).map((c) => (
                <li key={c.persona.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Cake size={18} /></span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <strong className="truncate text-sm">{nombreCompleto(c.persona)}</strong>
                    <span className="truncate text-xs text-muted">{c.cargo} · cumple {c.cumple}</span>
                  </span>
                  <Badge tone={c.faltan <= 3 ? "accent" : "neutral"}>{c.faltan === 0 ? "Hoy" : `En ${c.faltan} d`}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">Ningún cumpleaños en los próximos 45 días.</p>}
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

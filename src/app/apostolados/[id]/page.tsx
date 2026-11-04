import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CalendarDays, ClipboardList, FileSpreadsheet, FileText, FolderOpen, Camera, MessageCircle, NotebookPen, Users, Wallet,
} from "lucide-react";
import { AvisoSimulado, Badge, Card, Grid, Kpi, LinkButton, PageHeader, Table } from "@/components/ui";
import { Tabs } from "@/components/tabs";
import { BarrasHorizontales, Columnas, IngresosGastos } from "@/components/charts";
import { LogoApostolado } from "@/components/logo-apostolado";
import { formulariosDe, historialDe, servidoresDe } from "@/lib/data/historial";
import { HOY, diasEntre } from "@/lib/domain/fechas";
import { EconomiaPorRetiro } from "./economia";
import { Retencion } from "./retencion";
import { apostolado, db, economiaPorMes, nombreCompleto, persona } from "@/lib/data/repo";
import { enlacesDe, integrantesDe, type TipoEnlace } from "@/lib/data/apostolados";
import { DOCUMENTOS } from "@/lib/data/documentos";
import { aUSD, resultado, usd } from "@/lib/domain/economia";
import { fechaCorta as fc } from "@/lib/domain/fechas";

const fechaCorta = (d: string) => fc(d.length === 10 ? `${d}T12:00:00` : d);

export function generateStaticParams() {
  return db.apostolados.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps<"/apostolados/[id]">) {
  const { id } = await params;
  return { title: apostolado(id)?.nombre ?? "Apostolado" };
}

const ICONO: Record<TipoEnlace, typeof FileText> = {
  minuta: NotebookPen, formulario: ClipboardList, hoja: FileSpreadsheet, drive: FolderOpen,
  instagram: Camera, whatsapp: MessageCircle, calendario: CalendarDays,
};

export default async function Apostolado({ params }: PageProps<"/apostolados/[id]">) {
  const { id } = await params;
  const a = apostolado(id);
  if (!a) notFound();

  const integrantes = integrantesDe(id);
  const activos = integrantes.filter((x) => !x.hasta);
  const pasaron = integrantes.filter((x) => x.hasta);
  const acts = db.actividades.filter((x) => x.apostoladoId === id).sort((x, y) => y.inicio.localeCompare(x.inicio));
  const partic = acts.map((x) => ({
    actividad: x.nombre,
    participantes: db.participaciones.filter((p) => p.actividadId === x.id && p.rol === "participante").length,
    servidores: db.participaciones.filter((p) => p.actividadId === x.id && p.rol === "servidor").length,
  }));
  const totalPart = partic.reduce((s, x) => s + x.participantes, 0);
  const movs = db.movimientos.filter((m) => m.areaId === id);
  const r = resultado(movs);
  const docs = DOCUMENTOS.filter((d) => d.areaId === id).sort((x, y) => y.fecha.localeCompare(x.fecha));
  const enlaces = enlacesDe(id);
  const historial = historialDe(id);
  const hoyIso = HOY.toISOString().slice(0, 10);
  const pasadas = historial.filter((e) => e.fecha < hoyIso);
  const proximas = [
    ...acts.filter((x) => x.inicio.slice(0, 10) >= hoyIso).map((x) => ({ id: x.id, nombre: x.nombre, fecha: x.inicio.slice(0, 10), lugar: x.lugar })),
    ...historial.filter((e) => e.fecha >= hoyIso && !acts.some((x) => x.nombre === e.nombre)).map((e) => ({ id: e.id, nombre: e.nombre, fecha: e.fecha, lugar: e.ciudad })),
  ].sort((x, y) => x.fecha.localeCompare(y.fecha));
  const porCiudad = [...new Set(pasadas.map((e) => e.ciudad))].map((c) => ({ ciudad: c, personas: pasadas.filter((e) => e.ciudad === c).reduce((t, e) => t + e.participantes, 0), retiros: pasadas.filter((e) => e.ciudad === c).length })).sort((x, y) => y.personas - x.personas);
  const servidores = servidoresDe(id);
  const formularios = formulariosDe(id);

  const resumen = (
    <Grid min={340}>
      <Card title="Datos del apostolado">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">Descripción</dt><dd>{a.descripcion}</dd>
          <dt className="text-muted">Director</dt><dd>{a.directorId ? <Link href={`/personas/${a.directorId}`}>{nombreCompleto(persona(a.directorId))}</Link> : "—"}</dd>
          <dt className="text-muted">Ecónomo</dt><dd>{a.economoId ? <Link href={`/personas/${a.economoId}`}>{nombreCompleto(persona(a.economoId))}</Link> : "Sin asignar"}</dd>
          <dt className="text-muted">Correo</dt><dd>{a.correo ?? "—"}</dd>
          <dt className="text-muted">Formularios</dt>
          <dd>{acts.some((x) => x.formularioConectado) ? <Badge tone="good">Conectados</Badge> : <Badge tone="warn">Sin conectar</Badge>}</dd>
        </dl>
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Formularios y tablas</h3>
          <ul className="flex flex-col">
            {formularios.map((f) => (
              <li key={f.nombre} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-1.5 text-sm last:border-0">
                <span>{f.nombre}</span>
                <span className="flex gap-3 text-xs font-bold"><a href={f.form} target="_blank" rel="noreferrer">Formulario</a><a href={f.hoja} target="_blank" rel="noreferrer">Tabla</a></span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      <Card title="Próximos retiros" subtitle="Cuánto falta">
        <ul className="flex flex-col gap-3">
          {proximas.map((x) => {
            const d = diasEntre(HOY, x.fecha);
            return (
              <li key={x.id} className="flex flex-col gap-1 text-sm">
                <span className="flex justify-between gap-2"><strong>{x.nombre}</strong><span className="tabular-nums text-muted">{d} días</span></span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`Faltan ${d} días`}><span className="block h-full rounded-full bg-[var(--series-1)]" style={{ width: `${Math.max(4, 100 - (d / 180) * 100)}%` }} /></span>
                <span className="text-xs text-muted">{fechaCorta(x.fecha)} · {x.lugar}</span>
              </li>
            );
          })}
          {!proximas.length ? <li className="text-sm text-muted">Sin retiros programados.</li> : null}
        </ul>
      </Card>
      <Card title="Participantes por actividad" subtitle="Inscritos en 2026">
        {partic.some((x) => x.participantes) ? (
          <BarrasHorizontales data={partic.filter((x) => x.participantes)} x="actividad" y="participantes" nombre="Participantes" />
        ) : <p className="text-sm text-muted">Este apostolado aún no tiene actividades con inscripciones en la plataforma.</p>}
      </Card>
      <Card title="Retiros hechos" subtitle={`${pasadas.length} ediciones · ${pasadas.reduce((t, e) => t + e.participantes, 0)} personas`}>
        <Columnas data={pasadas.map((e) => ({ retiro: e.nombre.split(" ").slice(-1)[0], personas: e.participantes }))} x="retiro" y="personas" nombre="Participantes" alto={170} />
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Por ciudad</h3>
        <ul className="flex flex-col">
          {porCiudad.map((c) => <li key={c.ciudad} className="flex justify-between gap-2 border-b border-border py-1.5 text-sm last:border-0"><span>{c.ciudad}</span><span className="tabular-nums text-muted">{c.retiros} retiros · <strong className="text-ink">{c.personas}</strong> personas</span></li>)}
        </ul>
      </Card>
      <Card title="Retención" subtitle="Qué hicieron después quienes fueron a los retiros">
        <Retencion filas={pasadas.map((e) => ({ id: e.id, nombre: e.nombre, participantes: e.participantes, retencion: e.retencion }))} />
      </Card>
    </Grid>
  );

  const tablaIntegrantes = (lista: typeof integrantes, pasado: boolean) => (
    <Table head={["Nombre", "Cargo", "Desde", pasado ? "Hasta" : "Teléfono"]} minWidth={560}>
      {lista.map((x) => {
        const p = persona(x.personaId);
        return (
          <tr key={x.personaId + x.cargo}>
            <td className="font-semibold"><Link href={`/personas/${p.id}`} className="text-ink">{nombreCompleto(p)}</Link></td>
            <td>{x.cargo.startsWith("Director") || x.cargo === "Ecónomo" ? <Badge tone="accent">{x.cargo}</Badge> : x.cargo}</td>
            <td className="tabular-nums">{fechaCorta(x.desde)}</td>
            <td className="tabular-nums">{pasado ? fechaCorta(x.hasta!) : (p.telefono ?? "—")}</td>
          </tr>
        );
      })}
    </Table>
  );

  const integrantesTab = (
    <>
      <Card title="Integrantes activos" subtitle="Quienes sirven hoy en el apostolado" action={<LinkButton href="#" variant="secondary">Proponer integrante</LinkButton>}>
        {tablaIntegrantes(activos, false)}
      </Card>
      <Card title="Servidores por retiro" subtitle="Quiénes han servido y en cuántos retiros">
        <Table head={["Servidor", "Rol más frecuente", "Retiros servidos", "Último"]} minWidth={560}>
          {servidores.map((x) => (
            <tr key={x.personaId}>
              <td className="font-semibold"><Link href={`/personas/${x.personaId}`} className="text-ink">{x.nombre}</Link></td>
              <td>{x.rol}</td>
              <td><span className="flex items-center gap-2"><span className="h-2 w-20 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-[var(--series-1)]" style={{ width: `${(x.retiros / 7) * 100}%` }} /></span><strong className="tabular-nums">{x.retiros}</strong></span></td>
              <td className="text-muted">{x.ultimo}</td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title="Pasaron por el apostolado" subtitle="Histórico de integrantes">{tablaIntegrantes(pasaron, true)}</Card>
    </>
  );

  const documentosTab = (
    <Card title="Documentos del apostolado" subtitle="Viven en la carpeta de Drive del apostolado" action={<LinkButton href={`/economia?area=${id}`} variant="secondary">Ir a Economía</LinkButton>}>
      <ul className="flex flex-col">
        {docs.map((d) => (
          <li key={d.nombre} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2.5 last:border-0">
            <span className="flex items-center gap-2 text-sm font-semibold"><FileText size={16} aria-hidden className="text-accent" />{d.nombre}</span>
            <span className="flex items-center gap-2"><Badge>{d.tipo}</Badge><span className="text-xs text-muted tabular-nums">{fechaCorta(d.fecha)}</span></span>
          </li>
        ))}
      </ul>
    </Card>
  );

  const economiaTab = (
    <>
      <Card title="Economía por retiro" subtitle="Uno o varios retiros, por fechas: cuál dejó más ganancia y cuánto costó cada uno">
        <EconomiaPorRetiro filas={historial.map((e) => ({ id: e.id, nombre: e.nombre, fecha: e.fecha, ciudad: e.ciudad, costoUSD: e.costoUSD, participantes: e.participantes, ingresosUSD: e.ingresosUSD, gastosUSD: e.gastosUSD, fuente: e.fecha < hoyIso ? e.fuenteEconomia : null }))} />
      </Card>
      <h3 className="text-base font-extrabold">Movimientos de los últimos 6 meses</h3>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }}>
        <Kpi label="Ingresos (6 meses)" value={usd(r.ingresosUSD)} />
        <Kpi label="Gastos (6 meses)" value={usd(r.gastosUSD)} />
        <Kpi label="Ganancia" value={usd(r.ganancia)} tone={r.ganancia >= 0 ? "good" : "warn"} note={r.ganancia >= 0 ? "Se transfiere a la cuenta aparte" : "Pérdida en el periodo"} />
        <Kpi label="10 % para la localidad" value={usd(r.aporteLocalidad)} note="Sobre la ganancia" />
      </div>
      <Grid min={360}>
        <Card title="Ingresos y gastos por mes" subtitle="En dólares">
          <IngresosGastos data={economiaPorMes(id)} />
        </Card>
        <Card title="Últimos movimientos" action={<LinkButton href={`/economia?area=${id}`} variant="secondary">Abrir en Economía</LinkButton>}>
          <ul className="flex flex-col">
            {[...movs].sort((x, y) => y.fecha.localeCompare(x.fecha)).slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0">
                <span className="flex flex-col"><strong>{m.categoria}</strong><span className="text-xs text-muted">{fechaCorta(m.fecha)} · {m.custodio}</span></span>
                <span className={`font-bold tabular-nums ${m.tipo === "ingreso" ? "text-good-ink" : "text-ink"}`}>{m.tipo === "ingreso" ? "+" : "−"}{usd(aUSD(m.monto, m.moneda, m.tasaBCV))}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
    </>
  );

  const enlacesTab = (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))" }}>
      {enlaces.map((e) => {
        const Icon = ICONO[e.tipo];
        return (
          <a key={e.titulo} href={e.url} className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-ink no-underline transition-colors hover:border-brand">
            <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon size={20} /></span>
            <span className="flex flex-col">
              <strong className="text-sm">{e.titulo}</strong>
              <span className="text-xs text-muted">{e.fecha ? fechaCorta(e.fecha) : "Enlace por configurar"}</span>
            </span>
          </a>
        );
      })}
    </div>
  );

  return (
    <>
      <Link href="/apostolados" className="inline-flex min-h-10 items-center gap-1 self-start text-sm font-semibold"><ArrowLeft size={16} aria-hidden /> Apostolados</Link>
      <div className="flex items-center gap-4">
        <LogoApostolado id={id} nombre={a.nombre} size={64} />
        <div className="flex-1">
          <PageHeader
            title={a.nombre}
            description={a.descripcion}
            actions={<><LinkButton href="#documentos" variant="secondary">Documentos</LinkButton><LinkButton href={`/economia?area=${id}`}>Economía</LinkButton></>}
          />
        </div>
      </div>
      <AvisoSimulado />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }}>
        <Kpi icon={<Users size={16} />} label="Integrantes activos" value={activos.length} note={`${pasaron.length} pasaron por el apostolado`} />
        <Kpi icon={<CalendarDays size={16} />} label="Actividades" value={acts.length} note={`${totalPart} participantes en 2026`} />
        <Kpi icon={<Wallet size={16} />} label="Resultado 6 meses" value={usd(r.ganancia)} tone={r.ganancia >= 0 ? "good" : "warn"} note={r.ganancia >= 0 ? "Ganancia" : "Pérdida"} />
        <Kpi icon={<FileText size={16} />} label="Retiros hechos" value={pasadas.length} note={`${pasadas.reduce((t, e) => t + e.participantes, 0)} personas en total`} />
      </div>
      <Tabs
        tabs={[
          { label: "Resumen", content: resumen },
          { label: "Integrantes", content: integrantesTab, badge: <Badge>{activos.length}</Badge> },
          { label: "Documentos", content: documentosTab, badge: <Badge>{docs.length}</Badge>, ancla: "documentos" },
          { label: "Economía", content: economiaTab, ancla: "economia" },
          { label: "Enlaces y minutas", content: enlacesTab },
        ]}
      />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CalendarDays, ClipboardList, FileSpreadsheet, FileText, FolderOpen, Camera, MessageCircle, NotebookPen, Users, Wallet,
} from "lucide-react";
import { AvisoSimulado, Badge, Card, Grid, Kpi, LinkButton, PageHeader, Table } from "@/components/ui";
import { Tabs } from "@/components/tabs";
import { BarrasHorizontales, IngresosGastos } from "@/components/charts";
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
  const minutas = enlaces.filter((e) => e.tipo === "minuta");

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
          <dt className="text-muted">Última minuta</dt><dd>{minutas[0] ? `${minutas[0].titulo} · ${fechaCorta(minutas[0].fecha!)}` : "—"}</dd>
        </dl>
      </Card>
      <Card title="Participantes por actividad" subtitle="Inscritos en 2026">
        {partic.some((x) => x.participantes) ? (
          <BarrasHorizontales data={partic.filter((x) => x.participantes)} x="actividad" y="participantes" nombre="Participantes" />
        ) : <p className="text-sm text-muted">Este apostolado aún no tiene actividades con inscripciones en la plataforma.</p>}
      </Card>
      <Card title="Actividades" subtitle={`${acts.length} registradas`}>
        <ul className="flex flex-col">
          {acts.length ? acts.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-0">
              <span className="font-semibold">{x.nombre}</span>
              <span className="text-xs text-muted">{fechaCorta(x.inicio)} · {x.lugar}</span>
            </li>
          )) : <li className="text-sm text-muted">Sin actividades registradas.</li>}
        </ul>
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
      <Card title="Pasaron por el apostolado" subtitle="Histórico de integrantes">{tablaIntegrantes(pasaron, true)}</Card>
    </>
  );

  const documentosTab = (
    <Card title="Documentos del apostolado" subtitle="Viven en la carpeta de Drive del apostolado" action={<LinkButton href={`/documentos?area=${id}`} variant="secondary">Ver en Documentos</LinkButton>}>
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
      <PageHeader
        title={a.nombre}
        description={a.descripcion}
        actions={<><LinkButton href={`/documentos?area=${id}`} variant="secondary">Documentos</LinkButton><LinkButton href={`/economia?area=${id}`}>Economía</LinkButton></>}
      />
      <AvisoSimulado />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }}>
        <Kpi icon={<Users size={16} />} label="Integrantes activos" value={activos.length} note={`${pasaron.length} pasaron por el apostolado`} />
        <Kpi icon={<CalendarDays size={16} />} label="Actividades" value={acts.length} note={`${totalPart} participantes en 2026`} />
        <Kpi icon={<Wallet size={16} />} label="Resultado 6 meses" value={usd(r.ganancia)} tone={r.ganancia >= 0 ? "good" : "warn"} note={r.ganancia >= 0 ? "Ganancia" : "Pérdida"} />
        <Kpi icon={<FileText size={16} />} label="Documentos" value={docs.length} note={`${minutas.length} minutas enlazadas`} />
      </div>
      <Tabs
        tabs={[
          { label: "Resumen", content: resumen },
          { label: "Integrantes", content: integrantesTab, badge: <Badge>{activos.length}</Badge> },
          { label: "Documentos", content: documentosTab, badge: <Badge>{docs.length}</Badge> },
          { label: "Economía", content: economiaTab },
          { label: "Enlaces y minutas", content: enlacesTab },
        ]}
      />
    </>
  );
}

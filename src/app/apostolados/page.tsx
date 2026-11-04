import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { integrantesDe } from "@/lib/data/apostolados";
import { AvisoSimulado, Badge, Card, Grid, PageHeader, Table } from "@/components/ui";
import { LogoApostolado } from "@/components/logo-apostolado";
import { HISTORIAL } from "@/lib/data/historial";
import { HOY, diasEntre } from "@/lib/domain/fechas";
import { db, economiaPorArea, nombreCompleto, persona } from "@/lib/data/repo";
import { usd } from "@/lib/domain/economia";

export const metadata = { title: "Apostolados" };

export default function Apostolados() {
  const eco = economiaPorArea();
  const hoyIso = HOY.toISOString().slice(0, 10);
  const proximos = [
    ...db.actividades.filter((x) => x.apostoladoId && x.inicio.slice(0, 10) >= hoyIso && x.tipo === "retiro_apostolado").map((x) => ({ id: x.id, nombre: x.nombre, fecha: x.inicio.slice(0, 10), apostoladoId: x.apostoladoId! })),
    ...HISTORIAL.filter((e) => e.fecha >= hoyIso && !db.actividades.some((x) => x.nombre === e.nombre)).map((e) => ({ id: e.id, nombre: e.nombre, fecha: e.fecha, apostoladoId: e.apostoladoId })),
  ].sort((x, y) => x.fecha.localeCompare(y.fecha)).slice(0, 8);
  const retencion = db.apostolados.map((a) => {
    const ed = HISTORIAL.filter((e) => e.apostoladoId === a.id && e.fecha < hoyIso);
    const p = ed.reduce((t, e) => t + e.participantes, 0);
    const pct = (k: "de" | "equipo" | "otrasActividades") => (p ? Math.round((ed.reduce((t, e) => t + e.retencion[k], 0) / p) * 100) : 0);
    return { a, personas: p, de: pct("de"), equipo: pct("equipo"), otras: pct("otrasActividades") };
  }).sort((x, y) => y.otras - x.otras);

  return (
    <>
      <PageHeader title="Apostolados" description="Selecciona un apostolado para ver sus datos, integrantes, documentos, economía, minutas y enlaces." />
      <AvisoSimulado />
      <Grid min={300}>
        {db.apostolados.map((a) => {
          const e = eco.find((x) => x.areaId === a.id);
          const acts = db.actividades.filter((x) => x.apostoladoId === a.id);
          const conectados = acts.filter((x) => x.formularioConectado).length;
          return (
            <Link key={a.id} href={`/apostolados/${a.id}`} className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 text-ink no-underline transition-colors hover:border-brand">
              <div className="flex items-start justify-between gap-3">
                <LogoApostolado id={a.id} nombre={a.nombre} size={44} />
                <div className="flex flex-1 flex-col gap-0.5">
                  <h2 className="text-base font-extrabold">{a.nombre}</h2>
                  <p className="text-xs text-muted">{a.descripcion}</p>
                </div>
                <ChevronRight size={20} aria-hidden className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-muted">Director</dt><dd>{a.directorId ? nombreCompleto(persona(a.directorId)) : "—"}</dd>
                <dt className="text-muted">Integrantes</dt><dd>{integrantesDe(a.id).filter((x) => !x.hasta).length} activos</dd>
                <dt className="text-muted">Actividades</dt><dd>{acts.length}</dd>
                <dt className="text-muted">Formularios</dt><dd>{conectados ? <Badge tone="good">{conectados} conectado{conectados > 1 ? "s" : ""}</Badge> : <Badge tone="warn">Sin conectar</Badge>}</dd>
                {e ? (<><dt className="text-muted">Resultado 6 meses</dt><dd className={e.ganancia >= 0 ? "font-bold text-good-ink" : "font-bold text-warn-ink"}>{usd(e.ganancia)}</dd></>) : null}
              </dl>
            </Link>
          );
        })}
      </Grid>
      <Grid min={360}>
        <Card title="Próximos retiros" subtitle="Cuánto falta para cada uno">
          <ul className="flex flex-col gap-3">
            {proximos.map((x) => {
              const d = diasEntre(HOY, x.fecha);
              return (
                <li key={x.id} className="flex items-center gap-3 text-sm">
                  <LogoApostolado id={x.apostoladoId} nombre={db.apostolados.find((a) => a.id === x.apostoladoId)?.nombre ?? ""} size={28} />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="flex justify-between gap-2"><strong>{x.nombre}</strong><span className="tabular-nums text-muted">{d} días</span></span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`Faltan ${d} días`}><span className="block h-full rounded-full bg-[var(--series-1)]" style={{ width: `${Math.max(4, 100 - (d / 180) * 100)}%` }} /></span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Retención por apostolado" subtitle="De quienes fueron a sus retiros, qué porcentaje siguió">
          <Table head={["Apostolado", "Personas", "Otras actividades", "Con DE", "En equipo"]} minWidth={480}>
            {retencion.map((r) => (
              <tr key={r.a.id}>
                <td className="font-semibold">{r.a.nombre}</td>
                <td className="tabular-nums">{r.personas}</td>
                <td className="tabular-nums">{r.otras} %</td>
                <td className="tabular-nums">{r.de} %</td>
                <td className="tabular-nums">{r.equipo} %</td>
              </tr>
            ))}
          </Table>
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

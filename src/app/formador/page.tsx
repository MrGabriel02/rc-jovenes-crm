import Link from "next/link";
import { ArrowLeft, CalendarDays, Church, Download, Users } from "lucide-react";
import { AvisoSimulado, Badge, Card } from "@/components/ui";
import { CartaInicio } from "@/components/carta-inicio";
import { LogoApostolado } from "@/components/logo-apostolado";
import { db, nombreCompleto, persona, proximasActividades } from "@/lib/data/repo";
import { integrantesDe } from "@/lib/data/apostolados";
import { historialDe } from "@/lib/data/historial";
import { PROMOCIONES } from "@/lib/data/promocion";
import { cultosDelDia, horaLegible } from "@/lib/domain/culto";
import { HOY, diasEntre, fechaCorta, iso } from "@/lib/domain/fechas";
import { Recordatorios, type Recordatorio } from "./recordatorios";

export const metadata = { title: "Mi inicio" };

// Vista de ejemplo: el director del apostolado Search, con rol de formador.
const APOSTOLADO = "search";

const RECORDATORIOS: Recordatorio[] = [
  { id: "r1", titulo: "Reunión del equipo organizador de Search XXVI", fecha: "2026-11-05", hora: "20:00", aviso: "2 horas antes", repetir: "Cada 15 días" },
  { id: "r2", titulo: "Llamada con los embajadores de universidades", fecha: "2026-11-09", hora: "19:00", aviso: "30 minutos antes", repetir: "No se repite" },
  { id: "r3", titulo: "Revisión de inscritos y abonos", fecha: "2026-11-16", hora: "18:30", aviso: "1 día antes", repetir: "Cada mes" },
];

export default function Formador() {
  const a = db.apostolados.find((x) => x.id === APOSTOLADO)!;
  const yo = persona(a.directorId!);
  const hoyIso = HOY.toISOString().slice(0, 10);
  const integrantes = integrantesDe(APOSTOLADO).filter((x) => !x.hasta);
  const hist = historialDe(APOSTOLADO);
  const pasadas = hist.filter((e) => e.fecha < hoyIso);
  const ult = pasadas[pasadas.length - 1];
  const promo = PROMOCIONES.find((p) => p.apostoladoId === APOSTOLADO);
  const retiros = [
    ...hist.filter((e) => e.fecha >= hoyIso).map((e) => ({ id: e.id, nombre: e.nombre, fecha: e.fecha, propio: true })),
    ...db.actividades.filter((x) => (x.tipo === "retiro_seccion" || x.tipo === "vfc") && x.inicio >= hoyIso).map((x) => ({ id: x.id, nombre: x.nombre, fecha: x.inicio.slice(0, 10), propio: false })),
    { id: "triduo27", nombre: "Triduo de renovación 2027", fecha: "2027-07-02", propio: false },
    { id: "ee27", nombre: "Ejercicios Espirituales 2027", fecha: "2027-02-12", propio: false },
  ].sort((x, y) => x.fecha.localeCompare(y.fecha)).slice(0, 4);
  const agenda = proximasActividades(12).filter((x) => x.faltan <= 30);
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(HOY); d.setDate(d.getDate() + i); return iso(d); });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <Link href="/configuracion" className="inline-flex min-h-10 items-center gap-1 self-start text-sm font-semibold"><ArrowLeft size={16} aria-hidden />Volver a la administración</Link>
      <AvisoSimulado />
      <CartaInicio hoy={HOY} saludo={`Buenos días, ${yo.nombre}`} subtitulo={`Director de ${a.nombre}`} />

      <section aria-labelledby="mi-ap" className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <LogoApostolado id={APOSTOLADO} nombre={a.nombre} size={48} />
          <div className="flex flex-1 flex-col"><h2 id="mi-ap" className="text-lg font-extrabold">{a.nombre}</h2><span className="text-xs text-muted">{a.descripcion}</span></div>
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Integrantes", integrantes.length, <Users key="u" size={14} aria-hidden />],
            ["Inscritos al próximo", promo ? `${promo.inscritos}/${promo.meta}` : "—", null],
            ["Último retiro", ult ? ult.participantes : "—", null],
            ["Siguieron en DE", ult ? `${Math.round((ult.retencion.de / ult.participantes) * 100)}%` : "—", null],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-2xl bg-surface-2 p-3"><dt className="text-[11px] font-semibold text-muted">{l}</dt><dd className="text-xl font-extrabold tabular-nums">{v}</dd></div>
          ))}
        </dl>
      </section>

      <Card title="Próximos retiros" subtitle="Cuenta regresiva">
        <ul className="grid gap-2 sm:grid-cols-2">
          {retiros.map((r) => {
            const d = diasEntre(HOY, r.fecha);
            return (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--nav-2),var(--brand))] text-white">
                  <strong className="text-lg leading-none tabular-nums">{d}</strong><span className="text-[10px]">días</span>
                </span>
                <span className="flex flex-col text-sm"><strong>{r.nombre}</strong><span className="text-xs text-muted">{fechaCorta(`${r.fecha}T12:00:00`)}{r.propio ? " · tu apostolado" : " · sección"}</span></span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Reuniones de tu apostolado" subtitle="Te llega una notificación con el tiempo que elijas">
        <Recordatorios inicial={RECORDATORIOS} hoy={HOY.toISOString()} />
      </Card>

      <Card title="Tu calendario" subtitle="Esta semana y lo que viene en el mes">
        <ol className="grid grid-cols-7 gap-1 text-center">
          {dias.map((d) => {
            const c = cultosDelDia(d);
            return (
              <li key={d} className={`flex flex-col items-center gap-1 rounded-xl py-2 ${d === hoyIso ? "bg-accent-soft" : "bg-surface-2"}`}>
                <span className="text-[10px] font-bold uppercase text-muted">{new Date(`${d}T12:00:00`).toLocaleDateString("es-VE", { weekday: "short" })}</span>
                <span className="text-base font-extrabold tabular-nums">{d.slice(8)}</span>
                {c.length ? <Church size={12} aria-label={`Misa a las ${horaLegible(c[0].inicio)}`} className="text-brand" /> : <span className="h-3" />}
              </li>
            );
          })}
        </ol>
        <ul className="flex flex-col">
          {agenda.map((x) => (
            <li key={x.id} className="flex items-center gap-3 border-b border-border py-2 text-sm last:border-0">
              <CalendarDays size={16} aria-hidden className="shrink-0 text-accent" />
              <span className="flex flex-1 flex-col"><strong>{x.nombre}</strong><span className="text-xs text-muted">{fechaCorta(x.inicio)} · {x.lugar}</span></span>
              <Badge tone={x.apostoladoId === APOSTOLADO ? "accent" : "neutral"}>{x.faltan === 0 ? "Hoy" : `${x.faltan} d`}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted"><Download size={14} aria-hidden />En el teléfono: menú del navegador → “Agregar a la pantalla de inicio” para usarla como app.</p>
      <p className="text-center text-[11px] text-muted">Vista de ejemplo de {nombreCompleto(yo)}, con datos simulados.</p>
    </div>
  );
}

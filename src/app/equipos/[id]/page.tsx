import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { Columnas } from "@/components/charts";
import { db, nombreCompleto, persona } from "@/lib/data/repo";
import { INQUIETUDES, encuentrosDe, eventosEquipo, infoEquipo, todosLosEquipos } from "@/lib/data/equipos";
import { faltasSeguidas } from "@/lib/domain/asistencia";
import { ultimaDE } from "@/lib/domain/direccion";
import { describirFrecuencia, edadPromedio, frecuenciaDias } from "@/lib/domain/equipos";
import { HOY, edad, fechaCorta } from "@/lib/domain/fechas";
import { AvatarSanto } from "../componentes";
import { PasarAsistencia } from "./asistencia";
import { FotoEquipo, Inquietudes, Integrantes } from "./gestion";

export function generateStaticParams() {
  return todosLosEquipos().map((e) => ({ id: e.id }));
}

const HOY_ISO = HOY.toISOString().slice(0, 10);

export default async function Equipo({ params }: PageProps<"/equipos/[id]">) {
  const { id } = await params;
  const eq = todosLosEquipos().find((e) => e.id === id);
  if (!eq) notFound();
  const info = infoEquipo(eq.id);
  const enc = encuentrosDe(eq.id);
  const miembros = eq.miembros.map((m) => {
    const p = persona(m);
    return {
      id: m, nombre: nombreCompleto(p), faltas: faltasSeguidas(m, enc), edad: p.fechaNacimiento ? edad(p.fechaNacimiento, HOY) : null,
      tieneDE: !!ultimaDE(m, db.sesionesDE), tieneApostolado: db.participaciones.some((x) => x.personaId === m && x.rol === "servidor"),
      historial: enc.map((e) => e.asistentes.includes(m)),
    };
  });
  const eventos = eventosEquipo().filter((e) => e.equipoId === eq.id);
  const proximos = eventos.filter((e) => e.fecha >= HOY_ISO);
  const pasados = eventos.filter((e) => e.fecha < HOY_ISO).reverse();
  const asistenciaProm = enc.length ? Math.round((enc.reduce((a, e) => a + e.asistentes.length, 0) / (enc.length * eq.miembros.length)) * 100) : 0;
  const porEncuentro = enc.slice(-8).map((e) => ({ fecha: fechaCorta(`${e.fecha}T12:00:00`), asistentes: e.asistentes.length }));
  const conDE = miembros.filter((m) => m.tieneDE).length;
  const conApostolado = miembros.filter((m) => m.tieneApostolado).length;
  const alertas = miembros.filter((m) => m.faltas >= 4).length;
  const edadProm = edadPromedio(miembros.map((m) => m.edad).filter((x): x is number => x !== null));
  const otros = todosLosEquipos().filter((o) => o.id !== eq.id);
  const inquietudes = INQUIETUDES.filter((i) => i.equipoId === eq.id);

  return (
    <>
      <Link href="/equipos" className="text-sm font-semibold">← Equipos</Link>
      <PageHeader
        title={`Equipo ${eq.nombre}`}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1"><Users size={14} aria-hidden />Responsable: {nombreCompleto(persona(eq.responsableId))}</span>
            <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden />{info.ciudad}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays size={14} aria-hidden />{info.dia} {info.hora}</span>
          </span>
        }
        actions={<AvatarSanto nombre={eq.nombre} size={56} />}
      />
      <AvisoSimulado />

      <section id="info" className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold">Info del equipo</h2>
          <Badge tone="accent">Lo que ve el responsable en su inicio</Badge>
        </div>
        <Grid min={160}>
          <Kpi label="Integrantes" value={eq.miembros.length} note={edadProm ? `Edad promedio ${edadProm}` : undefined} />
          <Kpi label="Asistencia promedio" value={`${asistenciaProm}%`} note={`${enc.length} encuentros registrados`} />
          <Kpi label="Frecuencia" value={describirFrecuencia(frecuenciaDias(enc.map((e) => e.fecha)))} />
          <Kpi label="Con dirección espiritual" value={`${conDE} de ${miembros.length}`} />
          <Kpi label="Con apostolado" value={`${conApostolado} de ${miembros.length}`} />
          <Kpi label="4 faltas o más" value={alertas} tone={alertas ? "warn" : "neutral"} />
        </Grid>
        <Grid min={300}>
          <Card title="Asistentes por encuentro" subtitle="Últimos 8">
            <Columnas data={porEncuentro} x="fecha" y="asistentes" nombre="Asistentes" alto={180} />
          </Card>
          <Card title="Foto del equipo"><FotoEquipo nombre={eq.nombre} /></Card>
        </Grid>
      </section>

      <PasarAsistencia miembros={miembros} fechas={enc.map((e) => e.fecha)} />

      <Grid min={320}>
        <Card title="Integrantes" subtitle="Quien sale del equipo pasa a la lista de retirados con el motivo">
          <Integrantes inicial={miembros.map((m) => ({ id: m.id, nombre: m.nombre, detalle: [m.edad ? `${m.edad} años` : null, m.tieneDE ? "Con DE" : "Sin DE", m.tieneApostolado ? "Con apostolado" : null].filter(Boolean).join(" · ") }))} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card title="Próximos eventos">
            <ul className="flex flex-col gap-2">
              {proximos.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex flex-col"><strong>{e.titulo}</strong><span className="text-xs text-muted">{fechaCorta(`${e.fecha}T12:00:00`)}</span></span>
                  <Badge tone="accent">{e.tipo}</Badge>
                </li>
              ))}
              {!proximos.length ? <li className="text-sm text-muted">Nada programado.</li> : null}
            </ul>
          </Card>
          <Card title="Eventos pasados">
            <ul className="flex flex-col gap-2">
              {pasados.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex flex-col"><strong>{e.titulo}</strong><span className="text-xs text-muted">{fechaCorta(`${e.fecha}T12:00:00`)} · {e.asistentes} asistentes</span></span>
                  <Badge>{e.tipo}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Grid>

      <Grid min={320}>
        <Card title="Inquietudes del equipo" subtitle="Las registra el responsable o el administrador">
          <Inquietudes inicial={inquietudes} />
        </Card>
        <Card title="Otros equipos" subtitle="Solo los nombres: los datos de cada equipo los ve su responsable">
          <ul className="flex flex-wrap gap-2">
            {otros.map((o) => (
              <li key={o.id} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm"><AvatarSanto nombre={o.nombre} size={24} />{o.nombre}</li>
            ))}
          </ul>
        </Card>
      </Grid>
    </>
  );
}

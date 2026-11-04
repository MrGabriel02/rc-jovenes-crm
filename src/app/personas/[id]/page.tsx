import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { db, equipoDe, estadoPersona, historialPersona, nombreCompleto } from "@/lib/data/repo";
import { HOY, edad, fechaCorta } from "@/lib/domain/fechas";
import { EditarPersona } from "./editar";
import { realizadas } from "@/lib/domain/direccion";

export function generateStaticParams() {
  return db.personas.map((p) => ({ id: p.id }));
}

export default async function FichaPersona({ params }: PageProps<"/personas/[id]">) {
  const { id } = await params;
  const p = db.personas.find((x) => x.id === id);
  if (!p) notFound();
  const hist = historialPersona(p.id);
  const eq = equipoDe(p.id);
  const des = realizadas(db.sesionesDE).filter((s) => s.personaId === p.id).sort((a, b) => b.inicio.localeCompare(a.inicio));
  const seg = db.seguimientos.find((s) => s.personaId === p.id);
  const estado = estadoPersona(p.id);

  return (
    <>
      <Link href="/personas" className="text-sm font-semibold">← Personas</Link>
      <PageHeader title={nombreCompleto(p)} description={<>C.I. {p.cedula ?? "sin registrar"} · {p.profesion} · Zona {p.zona}</>} actions={<Badge tone={estado === "hace_vida" ? "good" : "neutral"}>{estado === "hace_vida" ? "Hace vida en la sección" : "Han pasado"}</Badge>} />
      <AvisoSimulado />
      <EditarPersona inicial={{ nombre: p.nombre, apellido: p.apellido, cedula: p.cedula ?? "", telefono: p.telefono ?? "", correo: p.correo ?? "", fechaNacimiento: p.fechaNacimiento ?? "", zona: p.zona ?? "", profesion: p.profesion ?? "" }} />
      <Grid min={180}>
        <Kpi label="Actividades" value={hist.length} />
        <Kpi label="Veces que sirvió" value={hist.filter((h) => h.rol === "servidor").length} />
        <Kpi label="DE realizadas" value={des.length} note={des[0] ? `Última: ${fechaCorta(des[0].inicio)}` : "Nunca"} />
        <Kpi label="Equipo" value={<span className="text-xl">{eq?.nombre ?? "Sin equipo"}</span>} />
      </Grid>
      <Grid min={340}>
        <Card title="Datos de contacto">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Teléfono</dt><dd>{p.telefono}</dd>
            <dt className="text-muted">Correo</dt><dd className="break-all">{p.correo}</dd>
            <dt className="text-muted">Nacimiento</dt><dd>{p.fechaNacimiento ? `${fechaCorta(`${p.fechaNacimiento}T12:00:00`)} ${p.fechaNacimiento.slice(0, 4)} · ${edad(p.fechaNacimiento, HOY)} años` : "Falta"}</dd>
            <dt className="text-muted">Etiquetas</dt><dd>{p.etiquetas.length ? p.etiquetas.map((e) => <Badge key={e} tone="accent">{e}</Badge>) : "—"}</dd>
          </dl>
        </Card>
        <Card title="Historial de actividades" subtitle="Cada formulario conectado suma aquí">
          <ol className="flex flex-col gap-2">
            {hist.length ? hist.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0">
                <span><strong>{h.actividad.nombre}</strong><br /><span className="text-xs text-muted">{fechaCorta(h.actividad.inicio)}</span></span>
                <Badge tone={h.rol === "servidor" ? "accent" : "neutral"}>{h.rol === "servidor" ? "Servidor" : "Participante"}</Badge>
              </li>
            )) : <li className="text-sm text-muted">Sin actividades registradas.</li>}
          </ol>
        </Card>
        <Card title="Dirección espiritual" subtitle="Solo fecha y director, nunca el contenido">
          <ol className="flex flex-col gap-1 text-sm">
            {des.slice(0, 8).map((d) => <li key={d.id}>{fechaCorta(d.inicio)} · {db.directores.find((x) => x.id === d.directorId)?.nombre}</li>)}
            {!des.length ? <li className="text-muted">Sin DE registradas.</li> : null}
          </ol>
        </Card>
        {seg ? (
          <Card title="Seguimiento post retiro" subtitle={db.actividades.find((a) => a.id === seg.actividadId)?.nombre}>
            <ul className="flex flex-col gap-1 text-sm">
              {Object.entries(seg.pasos).map(([k, v]) => <li key={k} className="flex justify-between"><span>{k.replace("_", " ")}</span><Badge tone={v === "respondio" ? "good" : "neutral"}>{v}</Badge></li>)}
            </ul>
          </Card>
        ) : null}
      </Grid>
    </>
  );
}

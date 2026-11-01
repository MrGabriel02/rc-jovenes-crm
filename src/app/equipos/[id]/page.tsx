import Link from "next/link";
import { notFound } from "next/navigation";
import { AvisoSimulado, Card, PageHeader } from "@/components/ui";
import { db, nombreCompleto, persona } from "@/lib/data/repo";
import { faltasSeguidas } from "@/lib/domain/asistencia";
import { ultimaDE } from "@/lib/domain/direccion";
import { PasarAsistencia } from "./asistencia";

export function generateStaticParams() {
  return db.equipos.map((e) => ({ id: e.id }));
}

export default async function Equipo({ params }: PageProps<"/equipos/[id]">) {
  const { id } = await params;
  const eq = db.equipos.find((e) => e.id === id);
  if (!eq) notFound();
  const enc = db.encuentros.filter((e) => e.equipoId === eq.id).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const miembros = eq.miembros.map((m) => {
    const p = persona(m);
    return {
      id: m, nombre: nombreCompleto(p), faltas: faltasSeguidas(m, enc),
      tieneDE: !!ultimaDE(m, db.sesionesDE), tieneApostolado: db.participaciones.some((x) => x.personaId === m && x.rol === "servidor"),
      historial: enc.map((e) => e.asistentes.includes(m)),
    };
  });
  return (
    <>
      <Link href="/equipos" className="text-sm font-semibold">← Equipos</Link>
      <PageHeader title={`Equipo ${eq.nombre}`} description={`Responsable: ${nombreCompleto(persona(eq.responsableId))} · ${eq.miembros.length} integrantes`} />
      <AvisoSimulado />
      <PasarAsistencia miembros={miembros} fechas={enc.map((e) => e.fecha)} />
      <Card title="Qué ve el responsable desde el teléfono" subtitle="La PWA guarda la lista sin conexión y la sincroniza al volver la señal">
        <ul className="list-disc pl-5 text-sm text-ink-2">
          <li>Crear el encuentro al momento (programado o espontáneo) y marcar a cada integrante con un toque.</li>
          <li>Marcar quién tiene dirección espiritual y quién tiene apostolado.</li>
          <li>Registrar la asistencia del equipo a Triduo o EE, VFC y fin de semana de equipo.</li>
          <li>Proponer nombres para invitar a Triduo y Ejercicios.</li>
        </ul>
      </Card>
    </>
  );
}

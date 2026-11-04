import { Suspense } from "react";
import { AvisoSimulado, Card, PageHeader } from "@/components/ui";
import { Embudo } from "@/components/charts";
import { db, embudo, nombreCompleto, persona } from "@/lib/data/repo";
import { calendarioPasos, pasosPendientes, pasoActual, seguimientoTerminado, tasasSeguimiento, PASOS_POST_RETIRO } from "@/lib/domain/seguimiento";
import { SEGUIMIENTOS_CERRADOS } from "@/lib/data/seguimiento";
import type { Actividad } from "@/lib/domain/types";
import { HOY } from "@/lib/domain/fechas";
import { TableroSeguimiento, type RetiroSeg } from "./tablero";

export const metadata = { title: "Seguimiento" };

export default function Seguimiento() {
  const armar = (a: Actividad, segs: typeof db.seguimientos): RetiroSeg => ({
    id: a.id,
    nombre: a.nombre,
    fin: a.fin,
    pasoActual: pasoActual(a.fin, HOY)?.titulo ?? "Aún no inicia",
    calendario: calendarioPasos(a.fin).map((p) => ({ clave: p.clave, titulo: p.titulo, dia: p.dia, fecha: p.fecha })),
    embudo: embudo(a.id),
    tasas: tasasSeguimiento(segs, a.fin, HOY),
    terminado: seguimientoTerminado(a.fin, HOY),
    personas: segs.map((s) => {
      const p = persona(s.personaId);
      return { id: p.id, nombre: nombreCompleto(p), primerNombre: p.nombre, telefono: p.telefono ?? "", pasos: s.pasos, pendientes: pasosPendientes(s, a.fin, HOY).map((x) => x.clave) };
    }),
  });
  const conSeg = (segs: typeof db.seguimientos) => db.actividades.filter((a) => a.seguimientoPostRetiro && segs.some((s) => s.actividadId === a.id));
  const retiros = conSeg(db.seguimientos).map((a) => armar(a, db.seguimientos.filter((s) => s.actividadId === a.id)));
  const cerrados = conSeg(SEGUIMIENTOS_CERRADOS).sort((a, b) => b.fin.localeCompare(a.fin)).map((a) => armar(a, SEGUIMIENTOS_CERRADOS.filter((s) => s.actividadId === a.id)));

  return (
    <>
      <PageHeader title="Seguimiento" description="Secuencia post retiro del documento CRM: D0 grupo, D+2 DE, D+4 equipo, D+7 misa, D+12 RC News, D+15 continuidad." />
      <AvisoSimulado />
      <Suspense fallback={<Card><p className="text-sm text-muted">Cargando…</p></Card>}>
        <TableroSeguimiento retiros={retiros} cerrados={cerrados} pasos={PASOS_POST_RETIRO.map((p) => ({ clave: p.clave, titulo: p.titulo, dia: p.dia }))} />
      </Suspense>
      <Card title="Cómo va cada retiro">
        <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))" }}>
          {retiros.map((r) => <div key={r.id} className="flex flex-col gap-2"><strong className="text-sm">{r.nombre}</strong><Embudo etapas={r.embudo} /></div>)}
        </div>
      </Card>
    </>
  );
}

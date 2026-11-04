import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader, Table } from "@/components/ui";
import { db, nombreCompleto } from "@/lib/data/repo";
import { NOTIF_ENVIADAS, NOTIF_PROGRAMADAS, describirDestino, fechaHora } from "@/lib/data/avisos";
import { Redactar } from "./componentes";

export const metadata = { title: "Notificaciones" };

export default function Notificaciones() {
  const apostolados = db.apostolados.map((a) => a.nombre);
  const tamanos: Record<string, number> = {};
  for (const r of db.roles) tamanos[`rol:${r.nombre}`] = 3 + (r.nombre.length % 13);
  for (const e of db.equipos) tamanos[`equipo:${e.nombre}`] = e.miembros.length + 1;
  for (const a of db.apostolados) tamanos[`apostolado:${a.nombre}`] = new Set(db.actividades.filter((x) => x.apostoladoId === a.id).flatMap((x) => db.participaciones.filter((p) => p.actividadId === x.id).map((p) => p.personaId))).size;
  const leidas = NOTIF_ENVIADAS.reduce((a, n) => a + (n.leidas ?? 0), 0);
  const enviadas = NOTIF_ENVIADAS.reduce((a, n) => a + n.destinatarios, 0);

  return (
    <>
      <PageHeader title="Notificaciones" description="Avisos dirigidos a todos, a un rol, a un equipo, a un apostolado o a personas concretas, al momento o programados." />
      <AvisoSimulado />
      <Grid min={180}>
        <Kpi label="Programadas" value={NOTIF_PROGRAMADAS.length} />
        <Kpi label="Enviadas en 30 días" value={NOTIF_ENVIADAS.length} note={`${enviadas} mensajes`} />
        <Kpi label="Tasa de lectura" value={`${Math.round((leidas / enviadas) * 100)}%`} note="Solo cuenta la app" tone="good" />
      </Grid>
      <Card title="Nueva notificación">
        <Redactar
          inicial={NOTIF_PROGRAMADAS}
          opciones={{ rol: db.roles.map((r) => r.nombre), equipo: db.equipos.map((e) => e.nombre), apostolado: apostolados, personas: db.personas.slice(0, 80).map((p) => ({ id: p.id, nombre: nombreCompleto(p) })), total: db.personas.length, tamanos }}
        />
      </Card>
      <Card title="Historial" subtitle="Lo que ya salió y cuántos lo abrieron">
        <Table head={["Notificación", "Para", "Canales", "Enviada", "Leída por"]} minWidth={720}>
          {NOTIF_ENVIADAS.map((n) => (
            <tr key={n.id}>
              <td><span className="flex flex-col"><strong>{n.titulo}</strong><span className="text-xs text-muted">{n.mensaje}</span></span></td>
              <td>{describirDestino(n)}</td>
              <td><span className="flex flex-wrap gap-1">{n.canales.map((c) => <Badge key={c}>{c}</Badge>)}</span></td>
              <td className="whitespace-nowrap">{fechaHora(n.envio)}</td>
              <td className="tabular-nums">{n.leidas} de {n.destinatarios}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

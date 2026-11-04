import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader, Table } from "@/components/ui";
import { BarrasHorizontales } from "@/components/charts";
import { alertasFaltas, db, nombreCompleto, persona } from "@/lib/data/repo";
import { EQUIPOS_INACTIVOS, FORANEOS, INQUIETUDES, LISTA_ESPERA, RETIRADOS, encuentrosDe, eventosEquipo, infoEquipo, todosLosEquipos } from "@/lib/data/equipos";
import { HOY, edad, fechaCorta, iso } from "@/lib/domain/fechas";
import { describirFrecuencia, edadPromedio, frecuenciaDias } from "@/lib/domain/equipos";
import { porcentajeAsistencia } from "@/lib/domain/asistencia";
import { AvatarSanto, AvisoResponsables, ListaEspera, NuevoEquipo, PanelEquipos, type ResumenEquipo } from "./componentes";

export const metadata = { title: "Equipos" };

export default function Equipos() {
  const alertas = alertasFaltas();
  const eventos = eventosEquipo();
  const hoy = iso(HOY);
  const equipos: ResumenEquipo[] = todosLosEquipos().map((e) => {
    const info = infoEquipo(e.id);
    const miembros = [e.responsableId, ...e.miembros].map(persona);
    const edades = miembros.map((p) => (p.fechaNacimiento ? edad(p.fechaNacimiento, HOY) : null)).filter((x): x is number => x !== null);
    const pasados = eventos.filter((x) => x.equipoId === e.id && x.fecha <= hoy);
    const enc = encuentrosDe(e.id);
    return {
      id: e.id, nombre: e.nombre, ciudad: info.ciudad, responsable: nombreCompleto(persona(e.responsableId)), dia: info.dia, hora: info.hora,
      integrantes: e.miembros.length, nombresIntegrantes: miembros.map((p) => p.nombre), edadPromedio: edadPromedio(edades),
      rangoEdad: edades.length ? `${Math.min(...edades)}-${Math.max(...edades)}` : "—",
      asistencia: porcentajeAsistencia(e.miembros, enc.filter((x) => x.fecha >= "2026-10-01")),
      alertas: alertas.filter((a) => a.equipo.id === e.id).length,
      fechasEventos: pasados.map((x) => x.fecha), frecuencia: describirFrecuencia(frecuenciaDias(enc.map((x) => x.fecha))),
      inquietudesAbiertas: INQUIETUDES.filter((i) => i.equipoId === e.id && i.estado !== "Resuelta").length,
    };
  });
  const enOctubre = eventos.filter((x) => x.fecha.startsWith("2026-10")).length;
  const proximos = eventos.filter((x) => x.fecha > hoy).slice(0, 8);
  const pasados = eventos.filter((x) => x.fecha <= hoy && x.tipo !== "Encuentro").reverse().slice(0, 6);
  const nombreEq = (id: string) => equipos.find((e) => e.id === id)?.nombre ?? id;
  const personas = db.personas.map((p) => ({ id: p.id, nombre: nombreCompleto(p) }));
  const ritmo = equipos.map((e) => ({ equipo: e.nombre, reuniones: e.fechasEventos.filter((f) => f >= "2026-09-01").length })).sort((a, b) => b.reuniones - a.reuniones);
  const tamanos = equipos.map((e) => ({ equipo: e.nombre, integrantes: e.integrantes })).sort((a, b) => b.integrantes - a.integrantes);
  const prom = edadPromedio(equipos.map((e) => e.edadPromedio).filter((x): x is number => x !== null));

  return (
    <>
      <PageHeader title="Equipos" description="Equipos de encuentro de Barquisimeto y otras ciudades: encuentros, integraciones, días de apostolado y la vida de cada equipo." />
      <AvisoSimulado />
      <div className="flex flex-wrap items-start gap-2">
        <NuevoEquipo personas={personas} />
        <AvisoResponsables equipos={equipos.map((e) => ({ id: e.id, nombre: e.nombre }))} />
      </div>
      <Grid min={170}>
        <Kpi label="Equipos activos" value={equipos.length} note={`${equipos.filter((e) => e.ciudad !== "Barquisimeto").length} en otras ciudades`} />
        <Kpi label="Integrantes" value={equipos.reduce((a, e) => a + e.integrantes, 0)} />
        <Kpi label="Reuniones en octubre" value={enOctubre} note="Encuentros y eventos" />
        <Kpi label="Edad promedio" value={prom ? `${prom} años` : "—"} />
        <Kpi label="En lista de espera" value={LISTA_ESPERA.length} />
        <Kpi label="Con 4 faltas o más" value={alertas.filter((a) => a.nivel === "crecimiento").length} tone="warn" note="Avisado crecimiento" />
      </Grid>
      <PanelEquipos equipos={equipos} />

      <Grid min={360}>
        <Card title="Próximos eventos" subtitle="Encuentros, integraciones y días de apostolado">
          <ul className="flex flex-col">
            {proximos.map((x) => (
              <li key={x.id} className="flex items-center gap-3 border-b border-border py-2 text-sm last:border-0">
                <span className="w-14 text-xs font-bold text-accent">{fechaCorta(`${x.fecha}T12:00:00`)}</span>
                <span className="flex flex-1 flex-col"><strong>{nombreEq(x.equipoId)}</strong><span className="text-xs text-muted">{x.titulo}</span></span>
                <Badge tone={x.tipo === "Encuentro" ? "neutral" : "accent"}>{x.tipo}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Eventos pasados" subtitle="Lo que no es encuentro semanal">
          <ul className="flex flex-col">
            {pasados.map((x) => (
              <li key={x.id} className="flex items-center gap-3 border-b border-border py-2 text-sm last:border-0">
                <span className="w-14 text-xs font-bold text-muted">{fechaCorta(`${x.fecha}T12:00:00`)}</span>
                <span className="flex flex-1 flex-col"><strong>{nombreEq(x.equipoId)}</strong><span className="text-xs text-muted">{x.titulo} · {x.asistentes} asistentes</span></span>
                <Badge tone="accent">{x.tipo}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>

      <h2 className="text-lg font-extrabold">Comparación entre equipos</h2>
      <Grid min={380}>
        <Card title="Ritmo de reuniones" subtitle="Reuniones desde septiembre, por equipo">
          <BarrasHorizontales data={ritmo} x="equipo" y="reuniones" nombre="Reuniones" color="var(--series-1)" />
        </Card>
        <Card title="Integrantes por equipo">
          <BarrasHorizontales data={tamanos} x="equipo" y="integrantes" nombre="Integrantes" color="var(--series-2)" />
        </Card>
      </Grid>
      <Card title="Frecuencia y edades" subtitle="Según lo que marca cada responsable">
        <Table head={["Equipo", "Ciudad", "Día y hora estimados", "Frecuencia real", "Edad promedio", "Rango"]} minWidth={680}>
          {equipos.map((e) => (
            <tr key={e.id}>
              <td><span className="flex items-center gap-2"><AvatarSanto nombre={e.nombre} size={28} /><strong>{e.nombre}</strong></span></td>
              <td>{e.ciudad}</td><td>{e.dia} {e.hora}</td><td>{e.frecuencia}</td><td className="tabular-nums">{e.edadPromedio ?? "—"}</td><td className="tabular-nums">{e.rangoEdad}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card id="espera" title="Lista de espera" subtitle="Personas que quieren entrar a un equipo (campos de la hoja Integración)">
        <ListaEspera equipos={equipos} inicial={LISTA_ESPERA.map((x) => ({ nr: x.nr, nombre: x.nombre, edad: x.fechaNacimiento ? edad(x.fechaNacimiento, HOY) : null, procedencia: x.procedencia, numero: x.numero, conocidos: x.conocidos, anadido: x.anadido }))} />
      </Card>

      <Grid min={320}>
        <Card title="Retirados de un equipo" subtitle="Quedan aquí para no perderles la pista">
          <ul className="flex flex-col gap-2 text-sm">
            {RETIRADOS.map((r) => (
              <li key={r.personaId} className="flex flex-col rounded-xl bg-surface-2 px-3 py-2">
                <strong>{nombreCompleto(persona(r.personaId))}</strong>
                <span className="text-xs text-muted">{r.equipo} · {fechaCorta(`${r.fecha}T12:00:00`)} · {r.motivo}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Foráneos" subtitle="Ya no viven en Barquisimeto pero se les tiene en cuenta">
          <ul className="flex flex-col gap-2 text-sm">
            {FORANEOS.map((f) => (
              <li key={f.personaId} className="flex flex-col rounded-xl bg-surface-2 px-3 py-2">
                <strong>{nombreCompleto(persona(f.personaId))}</strong>
                <span className="text-xs text-muted">{f.lugar} · antes en {f.equipoAnterior} · desde {f.desde}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Equipos inactivos">
          <ul className="flex flex-col gap-2 text-sm">
            {EQUIPOS_INACTIVOS.map((e) => (
              <li key={e.nombre} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                <AvatarSanto nombre={e.nombre} size={32} />
                <span className="flex flex-col"><strong>{e.nombre}</strong><span className="text-xs text-muted">{e.ciudad} · desde {fechaCorta(`${e.desde}T12:00:00`)} · {e.motivo}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
    </>
  );
}

// Capa de datos. Hoy lee la semilla simulada en memoria; la interfaz está pensada para
// reemplazarse por Firestore (colecciones con los mismos nombres) sin tocar las pantallas.
import * as s from "./semilla";
import { ICAFE_IDS } from "./crm";
import { HOY, diasEntre, diasParaCumpleanos, edad, mesesEntre } from "../domain/fechas";
import { faltasSeguidas, nivelAlertaFaltas, porcentajeAsistencia } from "../domain/asistencia";
import { cobertura, nivelAlertaDE, porConfirmar, realizadas, ultimaDE } from "../domain/direccion";
import { pasosPendientes } from "../domain/seguimiento";
import { resultado, aUSD } from "../domain/economia";
import type { Persona } from "../domain/types";

export const db = s;

export const nombreCompleto = (p: Pick<Persona, "nombre" | "apellido">) => `${p.nombre} ${p.apellido}`;
export const persona = (id: string) => s.personas.find((p) => p.id === id)!;
export const actividad = (id: string) => s.actividades.find((a) => a.id === id)!;
export const apostolado = (id: string | null) => (id ? s.apostolados.find((a) => a.id === id) ?? null : null);
export const equipoDe = (personaId: string) => s.equipos.find((e) => e.miembros.includes(personaId) || e.responsableId === personaId) ?? null;

/** "Hace vida" si tiene equipo, DE realizada o apostolado en los últimos 6 meses. */
export function estadoPersona(id: string) {
  if (equipoDe(id)) return "hace_vida" as const;
  const u = ultimaDE(id, s.sesionesDE);
  if (u && mesesEntre(u.inicio, HOY) < 6) return "hace_vida" as const;
  if (s.apostolados.some((a) => a.directorId === id || a.economoId === id)) return "hace_vida" as const;
  return "de_paso" as const;
}

export function historialPersona(id: string) {
  return s.participaciones
    .filter((p) => p.personaId === id)
    .map((p) => ({ ...p, actividad: actividad(p.actividadId) }))
    .sort((a, b) => b.actividad.inicio.localeCompare(a.actividad.inicio));
}

export function personasConResumen() {
  return s.personas.map((p) => {
    const hist = historialPersona(p.id);
    const eq = equipoDe(p.id);
    const u = ultimaDE(p.id, s.sesionesDE);
    return {
      ...p,
      nombreCompleto: nombreCompleto(p),
      estado: estadoPersona(p.id),
      actividades: hist.length,
      servicios: hist.filter((h) => h.rol === "servidor").length,
      equipo: eq?.nombre ?? null,
      ultimaDE: u?.inicio ?? null,
    };
  });
}

export function alertasFaltas() {
  return s.equipos.flatMap((eq) => {
    const enc = s.encuentros.filter((e) => e.equipoId === eq.id);
    return eq.miembros
      .map((m) => ({ personaId: m, equipo: eq, faltas: faltasSeguidas(m, enc) }))
      .map((x) => ({ ...x, nivel: nivelAlertaFaltas(x.faltas) }))
      .filter((x) => x.nivel);
  });
}

export function alertasDE() {
  const ids = new Set(s.sesionesDE.map((x) => x.personaId));
  return [...ids]
    .map((id) => ({ personaId: id, nivel: nivelAlertaDE(id, s.sesionesDE, HOY), ultima: ultimaDE(id, s.sesionesDE) }))
    .filter((x) => x.nivel);
}

export const deporConfirmar = () => porConfirmar(s.sesionesDE, HOY);

export function miembrosActivos() {
  return [...new Set(s.equipos.flatMap((e) => [e.responsableId, ...e.miembros]))];
}

export function coberturaDE(fecha = HOY) {
  return cobertura(miembrosActivos(), s.sesionesDE, fecha, 60);
}

export function coberturaPorMes() {
  return ["2026-05-31", "2026-06-30", "2026-07-31", "2026-08-31", "2026-09-30", "2026-10-31"].map((f) => ({
    mes: new Intl.DateTimeFormat("es-VE", { month: "short" }).format(new Date(`${f}T12:00:00`)),
    cobertura: coberturaDE(new Date(`${f}T12:00:00`)),
  }));
}

export function asistenciaPorEquipo() {
  return s.equipos.map((eq) => {
    const enc = s.encuentros.filter((e) => e.equipoId === eq.id && e.fecha >= "2026-10-01");
    return { equipo: eq.nombre, id: eq.id, asistencia: porcentajeAsistencia(eq.miembros, enc) };
  });
}

export function pendientesSeguimientoHoy() {
  const porActividad = new Map<string, { actividad: ReturnType<typeof actividad>; pasos: Map<string, { titulo: string; dia: number; personas: string[] }> }>();
  for (const seg of s.seguimientos) {
    const act = actividad(seg.actividadId);
    for (const p of pasosPendientes(seg, act.fin, HOY)) {
      const entry = porActividad.get(act.id) ?? { actividad: act, pasos: new Map() };
      const paso = entry.pasos.get(p.clave) ?? { titulo: p.titulo, dia: p.dia, personas: [] };
      paso.personas.push(seg.personaId);
      entry.pasos.set(p.clave, paso);
      porActividad.set(act.id, entry);
    }
  }
  return [...porActividad.values()].flatMap((e) =>
    [...e.pasos.entries()].map(([clave, p]) => ({ actividad: e.actividad, clave, ...p })),
  );
}

export function embudo(actividadId: string) {
  const segs = s.seguimientos.filter((x) => x.actividadId === actividadId);
  const ids = segs.map((x) => x.personaId);
  return [
    { etapa: "Participantes", n: ids.length },
    { etapa: "Contactados", n: segs.filter((x) => Object.values(x.pasos).some((v) => v !== "pendiente")).length },
    { etapa: "Aceptaron DE", n: segs.filter((x) => x.aceptoDE).length },
    { etapa: "Aceptaron equipo", n: segs.filter((x) => x.aceptoEquipo).length },
  ];
}

export function proximasActividades(n = 6) {
  return s.actividades
    .filter((a) => diasEntre(HOY, a.inicio) >= 0)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .slice(0, n)
    .map((a) => ({ ...a, faltan: diasEntre(HOY, a.inicio), apostolado: apostolado(a.apostoladoId)?.nombre ?? "Sección" }));
}

export function nombreArea(id: string) {
  if (id === "seccion") return "Sección (Triduo y EE)";
  if (id === "casa") return "La casa";
  return apostolado(id)?.nombre ?? id;
}

export function economiaPorMes(area?: string) {
  const meses = ["05", "06", "07", "08", "09", "10"];
  return meses.map((m) => {
    const movs = s.movimientos.filter((x) => x.fecha.slice(5, 7) === m && (!area || x.areaId === area));
    const r = resultado(movs);
    return { mes: new Intl.DateTimeFormat("es-VE", { month: "short" }).format(new Date(`2026-${m}-15T12:00:00`)), ingresos: Math.round(r.ingresosUSD), gastos: Math.round(r.gastosUSD) };
  });
}

export function economiaPorArea(mes?: string) {
  const areas = [...new Set(s.movimientos.map((m) => m.areaId))];
  return areas.map((a) => {
    const movs = s.movimientos.filter((m) => m.areaId === a && (!mes || m.fecha.slice(5, 7) === mes));
    return { areaId: a, nombre: nombreArea(a), ...resultado(movs) };
  }).sort((x, y) => y.ingresosUSD - x.ingresosUSD);
}

export function participantesPorActividad() {
  return s.actividades
    .map((a) => ({ actividad: a.nombre, participantes: s.participaciones.filter((p) => p.actividadId === a.id && p.rol === "participante").length, servidores: s.participaciones.filter((p) => p.actividadId === a.id && p.rol === "servidor").length }))
    .filter((x) => x.participantes > 0)
    .sort((a, b) => b.participantes - a.participantes);
}

export function deudores(actividadId: string) {
  return s.participaciones
    .filter((p) => p.actividadId === actividadId && p.montoInscripcion)
    .map((p) => {
      const pagado = (p.abonos ?? []).reduce((acc, a) => acc + aUSD(a.monto, a.moneda, s.TASA_BCV_HOY), 0);
      return { ...p, persona: persona(p.personaId), pagado, deuda: Math.max(0, (p.montoInscripcion ?? 0) - pagado) };
    });
}

export function kpisInicio() {
  const resumen = personasConResumen();
  const haceVida = resumen.filter((p) => p.estado === "hace_vida").length;
  const asist = asistenciaPorEquipo();
  return {
    haceVida,
    dePaso: resumen.length - haceVida,
    total: resumen.length,
    enSeguimiento: s.seguimientos.length,
    coberturaDE: coberturaDE(),
    asistencia: Math.round(asist.reduce((a, b) => a + b.asistencia, 0) / asist.length),
    equipos: s.equipos.length,
    deRealizadasMes: realizadas(s.sesionesDE).filter((x) => x.inicio.startsWith("2026-10")).length,
  };
}

/** Formadores: miembros de ICAFE, responsables de equipo, directores y ecónomos de apostolado. */
export function formadores() {
  const cargos = new Map<string, string>();
  for (const e of s.equipos) cargos.set(e.responsableId, `Responsable del equipo ${e.nombre}`);
  for (const a of s.apostolados) {
    if (a.directorId && !cargos.has(a.directorId)) cargos.set(a.directorId, `Director de ${a.nombre}`);
    if (a.economoId && !cargos.has(a.economoId)) cargos.set(a.economoId, `Ecónomo de ${a.nombre}`);
  }
  for (const id of ICAFE_IDS) if (!cargos.has(id)) cargos.set(id, "Miembro de ICAFE");
  return [...cargos].map(([id, cargo]) => ({ persona: persona(id), cargo }));
}

export function cumpleanosFormadores(dias = 30, hoy = HOY) {
  return formadores()
    .filter((f) => f.persona.fechaNacimiento)
    .map((f) => ({ ...f, faltan: diasParaCumpleanos(f.persona.fechaNacimiento!, hoy), cumple: edad(f.persona.fechaNacimiento!, hoy) + 1 }))
    .map((f) => ({ ...f, cumple: f.faltan === 0 ? f.cumple - 1 : f.cumple }))
    .filter((f) => f.faltan <= dias)
    .sort((a, b) => a.faltan - b.faltan);
}

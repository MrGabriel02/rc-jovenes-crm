/**
 * Datos SIMULADOS extra de los equipos de encuentro: ciudad, día de reunión, eventos que no son
 * encuentros, equipos de otras ciudades, lista de espera, retirados, foráneos e inquietudes.
 */
import { encuentros, equipos, personas } from "./semilla";
import type { Encuentro, Equipo } from "../domain/types";
import type { TipoEvento } from "../domain/equipos";

export interface InfoEquipo { ciudad: string; dia: string; hora: string; activo: boolean }

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const INFO_BASE: Record<string, InfoEquipo> = Object.fromEntries(
  equipos.map((e, i) => [e.id, { ciudad: "Barquisimeto", dia: DIAS[i % DIAS.length], hora: i % 3 === 0 ? "19:00" : i % 3 === 1 ? "19:30" : "18:30", activo: true }]),
);

/** Equipos de otras ciudades (con miembros de la base simulada). */
export const EQUIPOS_FUERA: Equipo[] = [
  { id: "eq13", nombre: "San Juan Bosco", responsableId: "p109", miembros: ["p110", "p111", "p112", "p113", "p114", "p115"], activo: true },
  { id: "eq14", nombre: "Santa Faustina", responsableId: "p116", miembros: ["p117", "p118", "p119", "p120", "p121"], activo: true },
  { id: "eq15", nombre: "San Ignacio", responsableId: "p122", miembros: ["p123", "p124", "p125", "p126"], activo: true },
];
const INFO_FUERA: Record<string, InfoEquipo> = {
  eq13: { ciudad: "Barinas", dia: "Jueves", hora: "19:00", activo: true },
  eq14: { ciudad: "Carora", dia: "Martes", hora: "18:30", activo: true },
  eq15: { ciudad: "Coro", dia: "Sábado", hora: "16:00", activo: true },
};

/** Equipos que dejaron de reunirse (no cuentan en las alertas). */
export const EQUIPOS_INACTIVOS = [
  { nombre: "San Pío", ciudad: "Barquisimeto", desde: "2026-03-01", motivo: "El responsable se mudó; los integrantes pasaron a otros equipos" },
  { nombre: "Santa Rosa de Lima", ciudad: "Chivacoa", desde: "2025-11-15", motivo: "Sin responsable" },
];

export const todosLosEquipos = (): Equipo[] => [...equipos, ...EQUIPOS_FUERA];
export const infoEquipo = (id: string): InfoEquipo => INFO_BASE[id] ?? INFO_FUERA[id];

/** Encuentros de los equipos de otras ciudades (cada 2 semanas). */
const ENCUENTROS_FUERA: Encuentro[] = EQUIPOS_FUERA.flatMap((eq, k) =>
  Array.from({ length: 4 }, (_, s) => {
    const d = new Date(`2026-09-${String(10 + k).padStart(2, "0")}T12:00:00`);
    d.setDate(d.getDate() + s * 14);
    return { id: `${eq.id}-${s}`, equipoId: eq.id, fecha: d.toISOString().slice(0, 10), programado: true, asistentes: eq.miembros.filter((_, i) => (i + s) % 4 !== 0) };
  }),
);

export interface EventoEquipo { id: string; equipoId: string; fecha: string; tipo: TipoEvento; titulo: string; asistentes: number | null }

/** Todos los eventos: encuentros (de la semilla) e integraciones, pasados y próximos. */
export function eventosEquipo(): EventoEquipo[] {
  const pasados: EventoEquipo[] = [...encuentros, ...ENCUENTROS_FUERA].map((e) => ({ id: e.id, equipoId: e.equipoId, fecha: e.fecha, tipo: "Encuentro", titulo: "Encuentro semanal", asistentes: e.asistentes.length }));
  const extras: EventoEquipo[] = [
    { id: "x1", equipoId: "eq1", fecha: "2026-10-18", tipo: "Parrilla", titulo: "Parrilla de integración", asistentes: 8 },
    { id: "x2", equipoId: "eq3", fecha: "2026-10-11", tipo: "Fútbol", titulo: "Partido contra el equipo Carlo Acutis", asistentes: 7 },
    { id: "x3", equipoId: "eq4", fecha: "2026-10-11", tipo: "Fútbol", titulo: "Partido contra el equipo Juan Pablo II", asistentes: 6 },
    { id: "x4", equipoId: "eq6", fecha: "2026-10-25", tipo: "Día de apostolado", titulo: "Visita al ancianato", asistentes: 7 },
    { id: "x5", equipoId: "eq9", fecha: "2026-10-04", tipo: "Comida", titulo: "Almuerzo del equipo", asistentes: 6 },
  ];
  const proximos: EventoEquipo[] = [...equipos, ...EQUIPOS_FUERA].map((eq, i) => {
    const d = new Date("2026-11-02T12:00:00");
    d.setDate(d.getDate() + (i % 6));
    return { id: `prox-${eq.id}`, equipoId: eq.id, fecha: d.toISOString().slice(0, 10), tipo: "Encuentro" as TipoEvento, titulo: "Encuentro semanal", asistentes: null };
  });
  proximos.push(
    { id: "px1", equipoId: "eq2", fecha: "2026-11-14", tipo: "Integración", titulo: "Noche de juegos", asistentes: null },
    { id: "px2", equipoId: "eq5", fecha: "2026-11-21", tipo: "Día de apostolado", titulo: "Jornada en el comedor", asistentes: null },
  );
  return [...pasados, ...extras, ...proximos].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export const encuentrosDe = (equipoId: string) => [...encuentros, ...ENCUENTROS_FUERA].filter((e) => e.equipoId === equipoId).sort((a, b) => a.fecha.localeCompare(b.fecha));

/** Lista de espera (mismos campos que la hoja "Integracion"). */
export const LISTA_ESPERA = [127, 128, 129, 130, 131, 132, 133].map((n, i) => {
  const p = personas[n];
  return {
    nr: i + 1, personaId: p.id, nombre: `${p.nombre} ${p.apellido.split(" ")[0]}`, fechaNacimiento: p.fechaNacimiento,
    procedencia: ["God's Plan Retreat 23", "Search XXV", "Mega Misiones 2026", "Invitado por un amigo", "Search XXV", "Todos Uno", "God's Plan Retreat 23"][i],
    numero: p.telefono, conocidos: i % 3 === 0 ? [personas[2 + i * 9].nombre] : [], anadido: `2026-10-${String(5 + i * 3).padStart(2, "0")}`,
  };
});

export const RETIRADOS = [
  { personaId: "p140", equipo: "San José", fecha: "2026-09-20", motivo: "Cambio de horario de estudios" },
  { personaId: "p141", equipo: "Guadalupe", fecha: "2026-10-02", motivo: "Pasó al equipo Santa Clara" },
  { personaId: "p142", equipo: "San Miguel", fecha: "2026-10-15", motivo: "No respondió después de 4 faltas" },
];

export const FORANEOS = [
  { personaId: "p143", lugar: "Caracas", equipoAnterior: "Pier Giorgio", desde: "2026-01" },
  { personaId: "p144", lugar: "Madrid, España", equipoAnterior: "Santa Teresa", desde: "2025-09" },
  { personaId: "p145", lugar: "Bogotá, Colombia", equipoAnterior: "San Agustín", desde: "2026-06" },
  { personaId: "p146", lugar: "Valencia", equipoAnterior: "Chiara Badano", desde: "2026-08" },
];

export type EstadoInquietud = "Abierta" | "En seguimiento" | "Resuelta";
export const INQUIETUDES: { id: string; equipoId: string; fecha: string; texto: string; autor: "Administrador" | "Responsable"; estado: EstadoInquietud }[] = [
  { id: "i1", equipoId: "eq1", fecha: "2026-10-20", texto: "Dos integrantes quieren cambiar el día de reunión por la universidad", autor: "Responsable", estado: "En seguimiento" },
  { id: "i2", equipoId: "eq2", fecha: "2026-10-28", texto: "Bajó la asistencia en el último mes; revisar la dinámica del encuentro", autor: "Administrador", estado: "Abierta" },
  { id: "i3", equipoId: "eq1", fecha: "2026-09-15", texto: "Pidieron un tema sobre noviazgo para el caso de vida", autor: "Responsable", estado: "Resuelta" },
  { id: "i4", equipoId: "eq7", fecha: "2026-10-30", texto: "Quieren organizar un día de apostolado juntos", autor: "Responsable", estado: "Abierta" },
];

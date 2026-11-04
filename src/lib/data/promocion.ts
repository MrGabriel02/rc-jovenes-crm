/**
 * Datos SIMULADOS de promoción: directorio de colegios, parroquias y otros lugares, embajadores por
 * promoción, embajadores de parroquia para Samuel y Emaús, y grupos de voluntarios.
 * Los nombres de personas salen de la base simulada; ninguno es real.
 */
export type TipoLugar = "Colegio" | "Parroquia" | "Universidad" | "Otro";

export interface Lugar {
  id: string; tipo: TipoLugar; nombre: string; zona: string; contacto: string;
  embajadores: string[]; ultimaVisita: string | null; jovenesAlcanzados: number; notas?: string;
}

export const LUGARES: Lugar[] = [
  { id: "l1", tipo: "Colegio", nombre: "Colegio Santo Tomás", zona: "Este", contacto: "Coordinación de pastoral", embajadores: ["p4", "p17"], ultimaVisita: "2026-10-14", jovenesAlcanzados: 64 },
  { id: "l2", tipo: "Colegio", nombre: "Colegio La Inmaculada", zona: "Centro", contacto: "Dirección", embajadores: ["p22"], ultimaVisita: "2026-09-30", jovenesAlcanzados: 41 },
  { id: "l3", tipo: "Colegio", nombre: "Unidad Educativa San Rafael", zona: "Oeste", contacto: "Profesora de religión", embajadores: [], ultimaVisita: null, jovenesAlcanzados: 0, notas: "Pidieron una charla en enero" },
  { id: "l4", tipo: "Colegio", nombre: "Colegio Nuestra Señora del Valle", zona: "Este", contacto: "Coordinación de 5.º año", embajadores: ["p9", "p38"], ultimaVisita: "2026-10-21", jovenesAlcanzados: 52 },
  { id: "l5", tipo: "Parroquia", nombre: "Parroquia San Juan Bautista", zona: "Centro", contacto: "Párroco", embajadores: ["p27"], ultimaVisita: "2026-10-05", jovenesAlcanzados: 30 },
  { id: "l6", tipo: "Parroquia", nombre: "Parroquia Nuestra Señora de Altagracia", zona: "Norte", contacto: "Grupo juvenil", embajadores: ["p51", "p56"], ultimaVisita: "2026-10-19", jovenesAlcanzados: 26 },
  { id: "l7", tipo: "Parroquia", nombre: "Parroquia La Sagrada Familia", zona: "Este", contacto: "Catequesis de confirmación", embajadores: [], ultimaVisita: "2026-08-24", jovenesAlcanzados: 18 },
  { id: "l8", tipo: "Universidad", nombre: "Universidad (pastoral universitaria)", zona: "Este", contacto: "Pastoral universitaria", embajadores: ["p62", "p65"], ultimaVisita: "2026-10-28", jovenesAlcanzados: 77 },
  { id: "l9", tipo: "Universidad", nombre: "Instituto universitario", zona: "Oeste", contacto: "Centro de estudiantes", embajadores: ["p70"], ultimaVisita: "2026-09-12", jovenesAlcanzados: 23 },
  { id: "l10", tipo: "Otro", nombre: "Club deportivo del este", zona: "Este", contacto: "Entrenador del equipo juvenil", embajadores: ["p73"], ultimaVisita: "2026-10-01", jovenesAlcanzados: 15 },
];

export interface Promocion { id: string; nombre: string; apostoladoId: string; fecha: string; meta: number; inscritos: number; embajadores: { personaId: string; lugarId: string; invitados: number; inscritos: number }[] }

export const PROMOCIONES: Promocion[] = [
  {
    id: "pr-adv", nombre: "Misiones de Adviento 2026", apostoladoId: "jfm", fecha: "2026-12-05", meta: 40, inscritos: 29,
    embajadores: [
      { personaId: "p4", lugarId: "l1", invitados: 14, inscritos: 6 }, { personaId: "p22", lugarId: "l2", invitados: 9, inscritos: 4 },
      { personaId: "p51", lugarId: "l6", invitados: 11, inscritos: 5 }, { personaId: "p62", lugarId: "l8", invitados: 18, inscritos: 9 },
      { personaId: "p73", lugarId: "l10", invitados: 6, inscritos: 1 },
    ],
  },
  {
    id: "pr-search", nombre: "Search XXVI", apostoladoId: "search", fecha: "2027-02-26", meta: 45, inscritos: 8,
    embajadores: [
      { personaId: "p17", lugarId: "l1", invitados: 7, inscritos: 3 }, { personaId: "p9", lugarId: "l4", invitados: 10, inscritos: 3 },
      { personaId: "p65", lugarId: "l8", invitados: 5, inscritos: 2 },
    ],
  },
  {
    id: "pr-sol", nombre: "Rally Solidaridad", apostoladoId: "solidaridad", fecha: "2026-11-29", meta: 60, inscritos: 47,
    embajadores: [
      { personaId: "p38", lugarId: "l4", invitados: 20, inscritos: 15 }, { personaId: "p27", lugarId: "l5", invitados: 16, inscritos: 12 },
      { personaId: "p70", lugarId: "l9", invitados: 12, inscritos: 8 },
    ],
  },
];

/** Embajadores de parroquia para los programas Samuel y Emaús. */
export const EMBAJADORES_PARROQUIA = [
  { personaId: "p27", lugarId: "l5", programa: "Samuel" as const, desde: "2026-03" },
  { personaId: "p51", lugarId: "l6", programa: "Emaús" as const, desde: "2025-10" },
  { personaId: "p56", lugarId: "l6", programa: "Samuel" as const, desde: "2026-06" },
  { personaId: "p80", lugarId: "l7", programa: "Emaús" as const, desde: "2026-09" },
];

/** Grupos de voluntarios: el post retiro y los programas de Soñar Despierto, con sus ayudantes. */
export const GRUPOS_VOLUNTARIOS = [
  { id: "g1", nombre: "Post retiro (equipo de seguimiento)", apostolado: "Todos", coordinador: "p6", ayudantes: ["p11", "p19", "p33", "p47"], tarea: "Escribir a cada joven según la secuencia D+2 a D+15" },
  { id: "g2", nombre: "Soñar Despierto · Visitas a ancianatos (VV)", apostolado: "Soñar Despierto", coordinador: "p30", ayudantes: ["p84", "p88", "p92"], tarea: "Visita los sábados cada 15 días" },
  { id: "g3", nombre: "Soñar Despierto · Casa hogar (CA)", apostolado: "Soñar Despierto", coordinador: "p31", ayudantes: ["p95", "p97", "p99", "p101", "p103"], tarea: "Tardes de juegos y tareas" },
  { id: "g4", nombre: "Soñar Despierto · Mega mercados (MM)", apostolado: "Soñar Despierto", coordinador: "p35", ayudantes: ["p105", "p107"], tarea: "Recolección y entrega de mercados" },
];

export const SUGERENCIAS_PROMOCION = [
  "Volver al Colegio Santo Tomás antes del 15 de noviembre: allí salió la mitad de los inscritos de Adviento.",
  "La Unidad Educativa San Rafael pidió una charla y aún no tiene embajador: asignar a alguien de la zona oeste.",
  "La Sagrada Familia no se visita desde agosto; aprovechar la catequesis de confirmación para invitar a Kerigma.",
  "Search XXVI va al 18 % de la meta: pedir a los embajadores de universidades que compartan el flyer esta semana.",
];

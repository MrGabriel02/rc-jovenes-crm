import { apostolados } from "./semilla";

export interface Documento { nombre: string; tipo: string; areaId: string; fecha: string }

const BASE: Documento[] = [
  { nombre: "Informe económico Triduo 2026", tipo: "Informe económico", areaId: "seccion", fecha: "2026-07-12" },
  { nombre: "Reporte de economía Ejercicios Espirituales 2026", tipo: "Informe económico", areaId: "seccion", fecha: "2026-02-25" },
  { nombre: "Minuta de consejo de sección (octubre)", tipo: "Minuta", areaId: "seccion", fecha: "2026-10-20" },
  { nombre: "Permiso Mega Misiones 2026", tipo: "Permiso", areaId: "jfm", fecha: "2026-03-10" },
  { nombre: "Nombramientos ciclo 2025-2026", tipo: "Nombramiento", areaId: "seccion", fecha: "2025-09-15" },
  { nombre: "Horario Triduo 2026", tipo: "Logística", areaId: "seccion", fecha: "2026-06-28" },
  { nombre: "Lista de necesidades Mega Misiones", tipo: "Logística", areaId: "jfm", fecha: "2026-03-01" },
];

/** Documentos simulados: los de la sección más una minuta, un informe y un permiso por apostolado. */
export const DOCUMENTOS: Documento[] = [
  ...BASE,
  ...apostolados.flatMap((a, i) => [
    { nombre: `Minuta de reunión de ${a.nombre}`, tipo: "Minuta", areaId: a.id, fecha: `2026-10-${String(10 + i).padStart(2, "0")}` },
    { nombre: `Informe económico de ${a.nombre} (septiembre)`, tipo: "Informe económico", areaId: a.id, fecha: "2026-10-05" },
    { nombre: `Planificación del ciclo de ${a.nombre}`, tipo: "Planificación", areaId: a.id, fecha: "2026-09-08" },
  ]),
];

/**
 * Requisitos del CRM que pidió el P. Elías (documento "CRM - RC.pdf"),
 * con el estado de cada parte en la plataforma. Se muestra en el inicio
 * para supervisar el avance.
 */
export type EstadoRequisito = "listo" | "en_curso" | "pendiente";

export interface Requisito {
  n: number;
  titulo: string;
  href: string;
  partes: { texto: string; estado: EstadoRequisito }[];
}

export const REQUISITOS: Requisito[] = [
  {
    n: 1, titulo: "Base de datos de los últimos 3 años", href: "/personas",
    partes: [
      { texto: "Ficha única por persona con su historial de actividades", estado: "listo" },
      { texto: "Detección y unión de duplicados", estado: "listo" },
      { texto: "Tabla general con todos los formularios (caminantes, servidores, responsables)", estado: "en_curso" },
      { texto: "Importar la base del año pasado y actualizar los datos", estado: "pendiente" },
    ],
  },
  {
    n: 2, titulo: "Seguimiento después de cada retiro", href: "/seguimiento",
    partes: [
      { texto: "Pasos del día 0 al 15 con fecha de cada uno", estado: "listo" },
      { texto: "Aviso al encargado del CRM de lo que toca hoy", estado: "listo" },
      { texto: "Paso en el que va cada persona", estado: "listo" },
      { texto: "Tasas de respuesta y archivo de retiros terminados", estado: "en_curso" },
      { texto: "Notificaciones en el teléfono", estado: "pendiente" },
    ],
  },
  {
    n: 3, titulo: "Vida de los equipos de encuentro", href: "/equipos",
    partes: [
      { texto: "Asistencia fácil para el responsable", estado: "listo" },
      { texto: "Aviso a las 2 faltas seguidas (responsable)", estado: "listo" },
      { texto: "Aviso a las 4 faltas seguidas (crecimiento)", estado: "listo" },
      { texto: "Registro de quién tiene DE y apostolado en el equipo", estado: "en_curso" },
      { texto: "Asistencia a triduo, EE, VFC y fin de semana (la marca el administrador)", estado: "pendiente" },
    ],
  },
  {
    n: 4, titulo: "Procedimientos de las cabezas de apostolado", href: "/apostolados",
    partes: [
      { texto: "Integrantes, documentos y economía por apostolado", estado: "listo" },
      { texto: "Evaluación de responsables por enlace después de cada actividad", estado: "listo" },
      { texto: "Propuesta de nuevos integrantes al director de sección", estado: "pendiente" },
    ],
  },
  {
    n: 5, titulo: "Dirección espiritual", href: "/direccion-espiritual",
    partes: [
      { texto: "Registro de cada DE con su fecha (agenda de citas o a mano)", estado: "listo" },
      { texto: "Aviso al director a los 2 meses sin DE", estado: "listo" },
      { texto: "Aviso al encargado del CRM a los 3 meses sin DE", estado: "listo" },
      { texto: "Lista de jóvenes por director y conexión con Google Calendar", estado: "pendiente" },
    ],
  },
  {
    n: 6, titulo: "Participación de los formadores", href: "/formacion",
    partes: [
      { texto: "Asistencia de cada formador a triduo o EE, VFC y fin de semana de formadores", estado: "listo" },
      { texto: "Alerta si un formador no fue a ninguna en el año", estado: "listo" },
      { texto: "Notificación al encargado del CRM cuando un formador falta", estado: "pendiente" },
    ],
  },
];

export function avanceRequisito(r: Requisito) {
  const listos = r.partes.filter((p) => p.estado === "listo").length;
  return { listos, total: r.partes.length, pct: Math.round((listos / r.partes.length) * 100) };
}

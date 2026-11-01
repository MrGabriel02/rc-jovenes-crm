/** Actividades obligatorias de un formador en el año (documento CRM, punto 6). */
export const OBLIGATORIAS_FORMADOR = ["retiro_anual", "vfc", "fin_semana_formadores"] as const;
export type Obligatoria = (typeof OBLIGATORIAS_FORMADOR)[number];

export const NOMBRE_OBLIGATORIA: Record<Obligatoria, string> = {
  retiro_anual: "Triduo o Ejercicios",
  vfc: "VFC",
  fin_semana_formadores: "Fin de semana de formadores",
};

export function evaluarFormador(asistio: Partial<Record<Obligatoria, boolean>>, realizadas: Obligatoria[]) {
  const faltas = realizadas.filter((a) => asistio[a] === false || asistio[a] === undefined);
  const asistidas = realizadas.filter((a) => asistio[a] === true);
  return {
    faltas,
    proponerDestitucion: realizadas.length === OBLIGATORIAS_FORMADOR.length && asistidas.length === 0,
  };
}

/**
 * Datos SIMULADOS del seguimiento de retiros ya terminados (archivados). Usa su propio hash para no
 * alterar la secuencia de la semilla.
 */
import { participaciones } from "./semilla";
import type { SeguimientoPersona } from "../domain/seguimiento";

const h = (s: string) => {
  let x = 2166136261;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
};

export const SEGUIMIENTOS_CERRADOS: SeguimientoPersona[] = participaciones
  .filter((p) => (p.actividadId === "mega26" || p.actividadId === "todosuno5") && p.rol === "participante")
  .map((p) => {
    const r = h(p.id);
    const respondio = r < 0.62;
    return {
      personaId: p.personaId, actividadId: p.actividadId,
      pasos: {
        grupo: "enviado", ofrecer_de: r < 0.4 ? "respondio" : "enviado", ofrecer_equipo: r < 0.5 ? "respondio" : "enviado",
        misa: "enviado", rc_news: r < 0.55 ? "respondio" : "enviado", continuidad: respondio ? "omitido" : r < 0.8 ? "respondio" : "enviado",
      },
      aceptoDE: r < 0.28, aceptoEquipo: r < 0.34,
    };
  });

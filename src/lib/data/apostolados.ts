import { apostolados, personas } from "./semilla";

/** Integrantes simulados por apostolado: cargo actual y quiénes ya pasaron. */
const CARGOS = ["Logística", "Comunicaciones", "Formación", "Integrante", "Integrante", "Integrante", "Música", "Integrante"];

export interface Integrante { personaId: string; cargo: string; desde: string; hasta: string | null }

export function integrantesDe(apostoladoId: string): Integrante[] {
  const i = apostolados.findIndex((a) => a.id === apostoladoId);
  const a = apostolados[i];
  if (!a) return [];
  const lista: Integrante[] = [];
  if (a.directorId) lista.push({ personaId: a.directorId, cargo: "Director del apostolado", desde: "2025-09-01", hasta: null });
  if (a.economoId) lista.push({ personaId: a.economoId, cargo: "Ecónomo", desde: "2025-09-01", hasta: null });
  const usados = new Set(lista.map((x) => x.personaId));
  const candidatos = personas.filter((p) => Number(p.id.slice(1)) % apostolados.length === i && !usados.has(p.id));
  candidatos.slice(0, 8).forEach((p, k) => lista.push({ personaId: p.id, cargo: CARGOS[k % CARGOS.length], desde: k % 3 ? "2026-01-15" : "2025-03-10", hasta: null }));
  candidatos.slice(8, 12).forEach((p, k) => lista.push({ personaId: p.id, cargo: k % 2 ? "Integrante" : "Logística", desde: "2024-02-01", hasta: k % 2 ? "2025-07-31" : "2025-12-15" }));
  return lista;
}

export type TipoEnlace = "minuta" | "formulario" | "drive" | "instagram" | "whatsapp" | "hoja" | "calendario";

export interface Enlace { tipo: TipoEnlace; titulo: string; url: string; fecha?: string }

/** Enlaces de cada apostolado. Las URL son marcadores hasta conectar las cuentas reales. */
export function enlacesDe(apostoladoId: string): Enlace[] {
  return [
    { tipo: "minuta", titulo: "Minuta de la última reunión", url: "#", fecha: "2026-10-27" },
    { tipo: "minuta", titulo: "Minuta de planificación del ciclo", url: "#", fecha: "2026-09-08" },
    { tipo: "formulario", titulo: "Formulario de inscripción (Google Forms)", url: "#" },
    { tipo: "hoja", titulo: "Hoja de respuestas conectada", url: "#" },
    { tipo: "drive", titulo: "Carpeta de Drive del apostolado", url: "#" },
    { tipo: "calendario", titulo: "Calendario del apostolado", url: "#" },
    { tipo: "whatsapp", titulo: "Grupo de servidores", url: "#" },
    ...(["gpr", "search", "jfm", "music"].includes(apostoladoId) ? [{ tipo: "instagram" as const, titulo: "Cuenta de Instagram", url: "#" }] : []),
  ];
}

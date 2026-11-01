export interface Candidato {
  cedula?: string | null;
  nombreCompleto: string;
  telefono?: string | null;
  fechaNacimiento?: string | null;
}

export function normalizarTexto(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizarCedula(c?: string | null) {
  if (!c) return null;
  const d = c.replace(/\D/g, "");
  return d.length >= 6 ? d : null;
}

/** Teléfonos venezolanos: 0412-1234567, +58 412 1234567, 4121234567 → 584121234567 */
export function normalizarTelefono(t?: string | null) {
  if (!t) return null;
  let d = t.replace(/\D/g, "");
  if (d.startsWith("58")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.length === 10 ? `58${d}` : null;
}

function tokens(n: string) {
  return normalizarTexto(n).split(" ").filter((t) => t.length > 1);
}

/** Similitud de nombres por tokens compartidos (0 a 1). "José A. Pérez" ~ "Jose Perez" = 1. */
export function similitudNombre(a: string, b: string) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.length || !tb.length) return 0;
  const comunes = ta.filter((t) => tb.includes(t)).length;
  return comunes / Math.min(ta.length, tb.length);
}

export type Veredicto = "misma" | "probable" | "distinta";

/**
 * misma: misma cédula, o (sin cédula en conflicto) mismo teléfono / misma fecha de nacimiento con nombre parecido.
 * probable: nombre muy parecido sin otro dato en común → bandeja de revisión manual.
 */
export function compararPersonas(a: Candidato, b: Candidato): Veredicto {
  const ca = normalizarCedula(a.cedula);
  const cb = normalizarCedula(b.cedula);
  if (ca && cb) return ca === cb ? "misma" : "distinta";
  const sim = similitudNombre(a.nombreCompleto, b.nombreCompleto);
  const ta = normalizarTelefono(a.telefono);
  const tb = normalizarTelefono(b.telefono);
  if (ta && tb && ta === tb && sim >= 0.5) return "misma";
  if (a.fechaNacimiento && a.fechaNacimiento === b.fechaNacimiento && sim >= 0.66) return "misma";
  if (sim >= 0.99) return "probable";
  return "distinta";
}

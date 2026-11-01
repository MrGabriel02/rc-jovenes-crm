export interface IngredienteReceta {
  ingrediente: string;
  unidad: string; // kg, und, l, paq…
  porPersona: number;
}

export interface Comida {
  dia: string;
  momento: string; // Desayuno, Merienda, Almuerzo, Cena
  plato: string;
  ingredientes: IngredienteReceta[];
}

export interface ItemCompra {
  ingrediente: string;
  unidad: string;
  necesario: number;
  disponible: number;
  faltante: number;
}

const redondear = (n: number, unidad: string) =>
  unidad === "und" || unidad === "paq" ? Math.ceil(n) : Math.ceil(n * 10) / 10;

/** Lista de compras escalada por asistentes, sumando ingredientes repetidos y restando lo disponible o donado. */
export function listaDeCompras(menu: Comida[], asistentes: number, disponible: Record<string, number> = {}): ItemCompra[] {
  const acc = new Map<string, { unidad: string; total: number }>();
  for (const c of menu) {
    for (const i of c.ingredientes) {
      const k = `${i.ingrediente}|${i.unidad}`;
      const prev = acc.get(k) ?? { unidad: i.unidad, total: 0 };
      prev.total += i.porPersona * asistentes;
      acc.set(k, prev);
    }
  }
  return [...acc.entries()]
    .map(([k, v]) => {
      const ingrediente = k.split("|")[0];
      const necesario = redondear(v.total, v.unidad);
      const disp = disponible[ingrediente] ?? 0;
      return { ingrediente, unidad: v.unidad, necesario, disponible: disp, faltante: Math.max(0, redondear(necesario - disp, v.unidad)) };
    })
    .sort((a, b) => a.ingrediente.localeCompare(b.ingrediente, "es"));
}

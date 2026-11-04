export interface IngredienteReceta {
  ingrediente: string;
  unidad: string; // kg, und, l, paq…
  porPersona: number;
  categoria?: CategoriaAlimento;
}

export const CATEGORIAS_ALIMENTO = ["Proteínas", "Granos y harinas", "Lácteos y huevos", "Frutas y verduras", "Panadería", "Bebidas", "Salsas y condimentos", "Otros"] as const;
export type CategoriaAlimento = (typeof CATEGORIAS_ALIMENTO)[number];

/**
 * Factor de apetito: las porciones de la receta son para un adulto promedio. En un retiro de
 * hombres jóvenes conviene subirlas (1,3 = 30 % más).
 */
export const FACTOR_APETITO = { normal: 1, jovenes: 1.3, jovenesHombres: 1.4 } as const;

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
  categoria: CategoriaAlimento;
}

const redondear = (n: number, unidad: string) =>
  unidad === "und" || unidad === "paq" ? Math.ceil(n) : Math.ceil(n * 10) / 10;

/** Lista de compras escalada por asistentes, sumando ingredientes repetidos y restando lo disponible o donado. */
export function listaDeCompras(menu: Comida[], asistentes: number, disponible: Record<string, number> = {}, factor = 1): ItemCompra[] {
  const acc = new Map<string, { unidad: string; total: number; categoria: CategoriaAlimento }>();
  for (const c of menu) {
    for (const i of c.ingredientes) {
      const k = `${i.ingrediente}|${i.unidad}`;
      const prev = acc.get(k) ?? { unidad: i.unidad, total: 0, categoria: i.categoria ?? "Otros" };
      prev.total += i.porPersona * asistentes * factor;
      acc.set(k, prev);
    }
  }
  return [...acc.entries()]
    .map(([k, v]) => {
      const ingrediente = k.split("|")[0];
      const necesario = redondear(v.total, v.unidad);
      const disp = disponible[ingrediente] ?? 0;
      return { ingrediente, unidad: v.unidad, necesario, disponible: disp, faltante: Math.max(0, redondear(necesario - disp, v.unidad)), categoria: v.categoria };
    })
    .sort((a, b) => a.ingrediente.localeCompare(b.ingrediente, "es"));
}

/** Agrupa la lista de compras por tipo de alimento, en el orden de CATEGORIAS_ALIMENTO. */
export function porTipoDeAlimento(lista: ItemCompra[]) {
  return CATEGORIAS_ALIMENTO.map((c) => ({ categoria: c, items: lista.filter((i) => i.categoria === c && i.faltante > 0) })).filter((g) => g.items.length);
}

const fmt = (n: number) => n.toLocaleString("es-VE", { maximumFractionDigits: 1 });

/** Lista de compras en texto plano, lista para pegar en WhatsApp o en un documento. */
export function textoListaCompras(titulo: string, lista: ItemCompra[]) {
  return [titulo, ...porTipoDeAlimento(lista).flatMap((g) => ["", g.categoria.toUpperCase(), ...g.items.map((i) => `- ${i.ingrediente}: ${fmt(i.faltante)} ${i.unidad}`)])].join("\n");
}

/** Menú con ingredientes y cantidades en texto plano. */
export function textoMenu(titulo: string, menu: Comida[], asistentes: number, factor = 1) {
  return [titulo, ...menu.flatMap((c) => ["", `${c.dia} · ${c.momento}: ${c.plato}`, ...c.ingredientes.map((i) => `- ${i.ingrediente}: ${fmt(redondear(i.porPersona * asistentes * factor, i.unidad))} ${i.unidad}`)])].join("\n");
}

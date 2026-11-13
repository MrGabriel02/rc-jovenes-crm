/**
 * Datos SIMULADOS de los retiros de la sección (Triduo y Ejercicios Espirituales), con la misma
 * estructura que los Excel de cada retiro: Inscripciones, Asociaciones, Pagos, Economía,
 * Necesidades, Menú y Tareas. Ningún nombre es real.
 */
import type { Comida } from "../domain/menu";
import { personas } from "./semilla";

export type TipoRetiro = "triduo" | "ee";
export const NOMBRE_RETIRO: Record<TipoRetiro, string> = { triduo: "Triduo de renovación", ee: "Ejercicios Espirituales" };

const h = (s: string) => {
  let x = 2166136261;
  for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  x = Math.imul(x ^ (x >>> 15), 2246822507);
  return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
};

export interface EdicionRetiro {
  id: string; tipo: TipoRetiro; anio: number; inicio: string; fin: string; lugar: string; costoUSD: number;
  inscritos: number; asociados: number; renovaciones: number; ingresosUSD: number; gastosUSD: number;
  formulario: { nombre: string; url: string; ultimaSync: string } | null;
}

export const EDICIONES: EdicionRetiro[] = [
  { id: "triduo24", tipo: "triduo", anio: 2024, inicio: "2024-07-05", fin: "2024-07-07", lugar: "Casa de retiros", costoUSD: 35, inscritos: 38, asociados: 9, renovaciones: 11, ingresosUSD: 1330, gastosUSD: 1105, formulario: null },
  { id: "triduo25", tipo: "triduo", anio: 2025, inicio: "2025-07-04", fin: "2025-07-06", lugar: "Casa de retiros", costoUSD: 40, inscritos: 44, asociados: 12, renovaciones: 14, ingresosUSD: 1760, gastosUSD: 1420, formulario: null },
  { id: "triduo26", tipo: "triduo", anio: 2026, inicio: "2026-07-03", fin: "2026-07-05", lugar: "Casa de retiros", costoUSD: 45, inscritos: 51, asociados: 18, renovaciones: 15, ingresosUSD: 2295, gastosUSD: 1877, formulario: { nombre: "Triduo 2026 (respuestas)", url: "https://docs.google.com/spreadsheets/", ultimaSync: "2026-07-02T21:00:00" } },
  { id: "triduo27", tipo: "triduo", anio: 2027, inicio: "2027-07-02", fin: "2027-07-04", lugar: "Casa de retiros", costoUSD: 50, inscritos: 31, asociados: 0, renovaciones: 0, ingresosUSD: 980, gastosUSD: 240, formulario: { nombre: "Triduo 2027 (respuestas)", url: "https://docs.google.com/spreadsheets/", ultimaSync: "2026-11-01T06:00:00" } },
  { id: "ee24", tipo: "ee", anio: 2024, inicio: "2024-02-16", fin: "2024-02-18", lugar: "Casa de retiros", costoUSD: 30, inscritos: 27, asociados: 0, renovaciones: 0, ingresosUSD: 810, gastosUSD: 702, formulario: null },
  { id: "ee25", tipo: "ee", anio: 2025, inicio: "2025-02-14", fin: "2025-02-16", lugar: "Casa de retiros", costoUSD: 35, inscritos: 33, asociados: 0, renovaciones: 0, ingresosUSD: 1155, gastosUSD: 948, formulario: null },
  { id: "ee26", tipo: "ee", anio: 2026, inicio: "2026-02-13", fin: "2026-02-15", lugar: "Casa de retiros", costoUSD: 40, inscritos: 46, asociados: 0, renovaciones: 0, ingresosUSD: 1840, gastosUSD: 1512, formulario: { nombre: "Ejercicios Espirituales 2026 (respuestas)", url: "https://docs.google.com/spreadsheets/", ultimaSync: "2026-02-12T20:00:00" } },
  { id: "ee27", tipo: "ee", anio: 2027, inicio: "2027-02-12", fin: "2027-02-14", lugar: "Casa de retiros", costoUSD: 45, inscritos: 12, asociados: 0, renovaciones: 0, ingresosUSD: 380, gastosUSD: 0, formulario: { nombre: "Ejercicios Espirituales 2027 (respuestas)", url: "https://docs.google.com/spreadsheets/", ultimaSync: "2026-11-01T06:00:00" } },
];

/** Cambios que trajo la última sincronización del formulario (datos que se van modificando). */
export const CAMBIOS_SYNC = [
  { fecha: "2026-11-01T06:00:00", texto: "3 inscripciones nuevas" },
  { fecha: "2026-10-30T06:00:00", texto: "1 persona corrigió su teléfono" },
  { fecha: "2026-10-29T06:00:00", texto: "2 pagos confirmados por el ecónomo" },
  { fecha: "2026-10-27T06:00:00", texto: "1 persona indicó restricción alimenticia (sin gluten)" },
];

const I = (ingrediente: string, unidad: string, porPersona: number, categoria: NonNullable<Comida["ingredientes"][number]["categoria"]>) => ({ ingrediente, unidad, porPersona, categoria });

export const MENUS: Record<TipoRetiro, Comida[]> = {
  triduo: [
    { dia: "Viernes", momento: "Cena", plato: "Hamburguesas con papas", ingredientes: [I("Pan de hamburguesa", "und", 2, "Panadería"), I("Carne molida", "kg", 0.12, "Proteínas"), I("Queso amarillo", "und", 2, "Lácteos y huevos"), I("Tomate", "kg", 0.05, "Frutas y verduras"), I("Papa", "kg", 0.2, "Frutas y verduras"), I("Salsa de tomate", "und", 0.05, "Salsas y condimentos")] },
    { dia: "Sábado", momento: "Desayuno", plato: "Arepas con queso y huevos", ingredientes: [I("Harina de maíz", "kg", 0.15, "Granos y harinas"), I("Queso blanco", "kg", 0.06, "Lácteos y huevos"), I("Huevos", "und", 2, "Lácteos y huevos"), I("Café", "kg", 0.01, "Bebidas")] },
    { dia: "Sábado", momento: "Merienda", plato: "Galletas y jugo", ingredientes: [I("Galletas", "paq", 0.5, "Otros"), I("Jugo", "l", 0.25, "Bebidas")] },
    { dia: "Sábado", momento: "Almuerzo", plato: "Arroz chino", ingredientes: [I("Arroz", "kg", 0.12, "Granos y harinas"), I("Pechuga de pollo", "kg", 0.15, "Proteínas"), I("Cebolla", "kg", 0.04, "Frutas y verduras"), I("Zanahoria", "kg", 0.03, "Frutas y verduras"), I("Salsa de soya", "und", 0.03, "Salsas y condimentos")] },
    { dia: "Sábado", momento: "Cena", plato: "Pasta blanca", ingredientes: [I("Pasta larga", "kg", 0.12, "Granos y harinas"), I("Crema de leche", "l", 0.05, "Lácteos y huevos"), I("Queso blanco", "kg", 0.03, "Lácteos y huevos"), I("Jamón", "kg", 0.04, "Proteínas")] },
    { dia: "Domingo", momento: "Desayuno", plato: "Quesadillas", ingredientes: [I("Tortillas", "paq", 0.42, "Panadería"), I("Queso amarillo", "und", 2, "Lácteos y huevos"), I("Huevos", "und", 1, "Lácteos y huevos"), I("Café", "kg", 0.01, "Bebidas")] },
    { dia: "Domingo", momento: "Almuerzo", plato: "Pabellón", ingredientes: [I("Carne para mechar", "kg", 0.15, "Proteínas"), I("Caraotas negras", "kg", 0.06, "Granos y harinas"), I("Arroz", "kg", 0.1, "Granos y harinas"), I("Plátano", "und", 0.5, "Frutas y verduras")] },
  ],
  ee: [
    { dia: "Viernes", momento: "Cena", plato: "Perros calientes", ingredientes: [I("Pan de perro", "und", 2, "Panadería"), I("Salchichas", "und", 2, "Proteínas"), I("Repollo", "kg", 0.04, "Frutas y verduras"), I("Papitas", "paq", 0.1, "Otros")] },
    { dia: "Sábado", momento: "Desayuno", plato: "Empanadas", ingredientes: [I("Harina de maíz", "kg", 0.15, "Granos y harinas"), I("Queso blanco", "kg", 0.05, "Lácteos y huevos"), I("Carne molida", "kg", 0.05, "Proteínas"), I("Café", "kg", 0.01, "Bebidas")] },
    { dia: "Sábado", momento: "Almuerzo", plato: "Pollo guisado con arroz", ingredientes: [I("Muslos de pollo", "kg", 0.25, "Proteínas"), I("Arroz", "kg", 0.12, "Granos y harinas"), I("Pimentón", "kg", 0.03, "Frutas y verduras"), I("Cebolla", "kg", 0.03, "Frutas y verduras")] },
    { dia: "Sábado", momento: "Cena", plato: "Pasticho", ingredientes: [I("Pasta para pasticho", "paq", 0.12, "Granos y harinas"), I("Carne molida", "kg", 0.1, "Proteínas"), I("Queso amarillo", "und", 2, "Lácteos y huevos"), I("Leche", "l", 0.08, "Lácteos y huevos")] },
    { dia: "Domingo", momento: "Desayuno", plato: "Panquecas", ingredientes: [I("Harina para panquecas", "kg", 0.08, "Granos y harinas"), I("Huevos", "und", 1, "Lácteos y huevos"), I("Papelón", "kg", 0.03, "Otros")] },
  ],
};

export interface Tarea { id: string; tarea: string; dia: number; responsable: string; hecha: boolean }
export const TAREAS: Record<TipoRetiro, Tarea[]> = {
  triduo: [
    { id: "t1", tarea: "Confirmar casa de retiro y pagar el anticipo", dia: -60, responsable: "Ecónomo", hecha: true },
    { id: "t2", tarea: "Hacer o modificar el horario", dia: -45, responsable: "Coordinador", hecha: true },
    { id: "t3", tarea: "Pedir a los responsables los nombres para invitar", dia: -40, responsable: "Crecimiento", hecha: true },
    { id: "t4", tarea: "Abrir el formulario de inscripción", dia: -30, responsable: "Administrador CRM", hecha: true },
    { id: "t5", tarea: "Invitar a los formadores que faltan", dia: -21, responsable: "Director de sección", hecha: false },
    { id: "t6", tarea: "Cerrar el menú y la lista de compras", dia: -10, responsable: "Cocina", hecha: false },
    { id: "t7", tarea: "Imprimir horarios y hojas de dirección espiritual", dia: -5, responsable: "Materiales", hecha: false },
    { id: "t8", tarea: "Comprar el mercado", dia: -3, responsable: "Cocina", hecha: false },
    { id: "t9", tarea: "Asignar cabañas y grupos", dia: -2, responsable: "Coordinador", hecha: false },
    { id: "t10", tarea: "Preparar el acta de asociación", dia: -1, responsable: "Director de sección", hecha: false },
    { id: "t11", tarea: "Informe económico del retiro", dia: 7, responsable: "Ecónomo", hecha: false },
  ],
  ee: [
    { id: "e1", tarea: "Reservar la casa y al sacerdote que predica", dia: -60, responsable: "Director de sección", hecha: true },
    { id: "e2", tarea: "Abrir el formulario de inscripción", dia: -30, responsable: "Administrador CRM", hecha: true },
    { id: "e3", tarea: "Cerrar menú y compras", dia: -10, responsable: "Cocina", hecha: false },
    { id: "e4", tarea: "Preparar libretas de meditación", dia: -5, responsable: "Materiales", hecha: false },
    { id: "e5", tarea: "Informe económico del retiro", dia: 7, responsable: "Ecónomo", hecha: false },
  ],
};

export const PROVEEDORES = [
  { id: "pv1", nombre: "Mercado mayorista", tipo: "Frutas y verduras", direccion: "Zona industrial, galpón 3", contacto: "Encargado de ventas", telefono: "0251-000-0001" },
  { id: "pv2", nombre: "Carnicería del centro", tipo: "Proteínas", direccion: "Av. principal, local 12", contacto: "Dueño", telefono: "0414-000-0002" },
  { id: "pv3", nombre: "Distribuidora de víveres", tipo: "Granos y harinas", direccion: "Carrera 19 con calle 30", contacto: "Ventas al mayor", telefono: "0424-000-0003" },
  { id: "pv4", nombre: "Panadería de la esquina", tipo: "Panadería", direccion: "Calle 25 entre carreras 18 y 19", contacto: "Encargada", telefono: "0412-000-0004" },
  { id: "pv5", nombre: "Lácteos del valle", tipo: "Lácteos y huevos", direccion: "Vía a Quíbor, km 4", contacto: "Productor", telefono: "0416-000-0005" },
];

/** Hoja "Asociaciones": cada joven invitado y en qué paso va. */
export const PASOS_INVITACION = ["invitacion", "agenda", "de", "acepta", "inscripcion"] as const;
export type PasoInvitacion = (typeof PASOS_INVITACION)[number];
export const NOMBRE_PASO: Record<PasoInvitacion, string> = { invitacion: "Recibió invitación", agenda: "Contestó y agendó", de: "Vio dirección espiritual", acepta: "Acepta asociarse", inscripcion: "Se inscribió" };

export interface Invitado { id: string; personaId: string; nombre: string; equipo: string; pasos: Record<PasoInvitacion, boolean>; no: boolean }

const EQUIPOS_INV = ["San José", "Pier Giorgio", "Juan Pablo II", "Carlo Acutis", "San Miguel", "Guadalupe"];
export const INVITADOS: Invitado[] = personas.slice(20, 52).map((p, i) => {
  const r = h(p.id + "inv");
  const n = r < 0.12 ? 0 : r < 0.25 ? 1 : r < 0.4 ? 2 : r < 0.55 ? 3 : r < 0.68 ? 4 : 5;
  const pasos = Object.fromEntries(PASOS_INVITACION.map((k, j) => [k, j < n])) as Record<PasoInvitacion, boolean>;
  return { id: `inv${i}`, personaId: p.id, nombre: `${p.nombre} ${p.apellido.split(" ")[0]}`, equipo: EQUIPOS_INV[i % EQUIPOS_INV.length], pasos, no: n >= 1 && n < 3 && h(p.id + "no") < 0.35 };
});

/** Hoja "Pagos" del retiro en curso. */
export interface Pago { id: string; nombre: string; metodo: "Pago móvil" | "Zelle" | "Efectivo $" | "Transferencia"; montoBs: number; montoUSD: number; fecha: string }
export const TASA_BCV = 365;
export const PAGOS: Pago[] = personas.slice(52, 70).map((p, i) => {
  const r = h(p.id + "pago");
  const metodo = (["Pago móvil", "Zelle", "Efectivo $", "Transferencia"] as const)[Math.floor(r * 4)];
  const usd = r < 0.3 ? 25 : 50;
  return { id: `pg${i}`, nombre: `${p.nombre} ${p.apellido.split(" ")[0]}`, metodo, montoBs: metodo === "Pago móvil" || metodo === "Transferencia" ? usd * TASA_BCV : 0, montoUSD: metodo === "Zelle" || metodo === "Efectivo $" ? usd : 0, fecha: `2026-10-${String(5 + i).padStart(2, "0")}` };
});

/** Hoja "Economía": gastos e ingresos que no son inscripciones. */
export const GASTOS_RETIRO = [
  { id: "g1", descripcion: "Anticipo de la casa de retiro", montoUSD: 200, tipo: "Operativo", fecha: "2026-09-15" },
  { id: "g2", descripcion: "Impresión de horarios", montoUSD: 18, tipo: "Materiales", fecha: "2026-10-20" },
  { id: "g3", descripcion: "Libretas y lapiceros", montoUSD: 22, tipo: "Materiales", fecha: "2026-10-22" },
];

/** Campos del formulario de inscripción (mismos que los formularios anteriores). */
export const CAMPOS_FORMULARIO: Record<TipoRetiro, { campo: string; tipo: string; obligatorio: boolean }[]> = {
  triduo: [
    { campo: "Nombre y apellido", tipo: "Texto", obligatorio: true }, { campo: "Cédula de identidad", tipo: "Texto", obligatorio: true },
    { campo: "¿Ya estás asociado al Regnum Christi?", tipo: "Sí / No", obligatorio: true }, { campo: "¿Tienes grupo de encuentro?", tipo: "Sí / No", obligatorio: true },
    { campo: "¿Tienes alguna restricción alimenticia? (indica cuál)", tipo: "Texto", obligatorio: false }, { campo: "¿Quién te invitó?", tipo: "Texto", obligatorio: false },
    { campo: "¿Cuál es tu ciudad?", tipo: "Texto", obligatorio: true }, { campo: "¿Qué edad tienes?", tipo: "Número", obligatorio: true },
    { campo: "Número telefónico", tipo: "Texto", obligatorio: true }, { campo: "Método de pago", tipo: "Opciones", obligatorio: true }, { campo: "Comprobante de pago", tipo: "Archivo", obligatorio: false },
  ],
  ee: [
    { campo: "Nombre y apellido", tipo: "Texto", obligatorio: true }, { campo: "Edad", tipo: "Número", obligatorio: true }, { campo: "Cédula", tipo: "Texto", obligatorio: true },
    { campo: "Número telefónico", tipo: "Texto", obligatorio: true }, { campo: "Correo electrónico", tipo: "Correo", obligatorio: true },
    { campo: "Contacto de emergencia (nombre y parentesco)", tipo: "Texto", obligatorio: true }, { campo: "¿Tienes alguna alergia o restricción alimenticia? (indica cuál)", tipo: "Texto", obligatorio: false },
    { campo: "¿Ya has participado antes en ejercicios espirituales?", tipo: "Sí / No", obligatorio: true }, { campo: "¿Estás asociado al Regnum Christi?", tipo: "Sí / No", obligatorio: true },
    { campo: "¿Tienes encuentro con Cristo? (nombre de tu responsable)", tipo: "Texto", obligatorio: false }, { campo: "¿Tienes director espiritual? (indica su nombre)", tipo: "Texto", obligatorio: false },
    { campo: "¿Tienes apostolado? (indica cuál)", tipo: "Texto", obligatorio: false }, { campo: "Método de pago", tipo: "Opciones", obligatorio: true },
    { campo: "Monto Bs", tipo: "Número", obligatorio: false }, { campo: "Monto $", tipo: "Número", obligatorio: false }, { campo: "Fecha de pago", tipo: "Fecha", obligatorio: true },
  ],
};

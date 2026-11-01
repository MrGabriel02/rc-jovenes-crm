// Plantilla SIMULADA del Triduo, basada en la estructura de los documentos de menú y necesidades.
import type { Comida } from "../domain/menu";

export const MENU_TRIDUO: Comida[] = [
  { dia: "Viernes", momento: "Cena", plato: "Hamburguesas", ingredientes: [
    { ingrediente: "Pan de hamburguesa", unidad: "und", porPersona: 2 }, { ingrediente: "Carne molida", unidad: "kg", porPersona: 0.12 },
    { ingrediente: "Queso amarillo", unidad: "und", porPersona: 2 }, { ingrediente: "Tomate", unidad: "kg", porPersona: 0.05 }, { ingrediente: "Papa", unidad: "kg", porPersona: 0.2 } ] },
  { dia: "Sábado", momento: "Desayuno", plato: "Arepas con acompañantes", ingredientes: [
    { ingrediente: "Harina de maíz", unidad: "kg", porPersona: 0.15 }, { ingrediente: "Queso blanco", unidad: "kg", porPersona: 0.06 }, { ingrediente: "Huevos", unidad: "und", porPersona: 2 } ] },
  { dia: "Sábado", momento: "Almuerzo", plato: "Arroz chino", ingredientes: [
    { ingrediente: "Arroz", unidad: "kg", porPersona: 0.12 }, { ingrediente: "Pechuga de pollo", unidad: "kg", porPersona: 0.15 }, { ingrediente: "Cebolla", unidad: "kg", porPersona: 0.04 }, { ingrediente: "Zanahoria", unidad: "kg", porPersona: 0.03 } ] },
  { dia: "Sábado", momento: "Cena", plato: "Pasta blanca", ingredientes: [
    { ingrediente: "Pasta larga", unidad: "kg", porPersona: 0.12 }, { ingrediente: "Crema de leche", unidad: "l", porPersona: 0.05 }, { ingrediente: "Queso blanco", unidad: "kg", porPersona: 0.03 } ] },
  { dia: "Domingo", momento: "Desayuno", plato: "Quesadillas", ingredientes: [
    { ingrediente: "Tortillas", unidad: "paq", porPersona: 0.42 }, { ingrediente: "Queso amarillo", unidad: "und", porPersona: 2 }, { ingrediente: "Huevos", unidad: "und", porPersona: 1 } ] },
];

export const TAREAS_TRIDUO = [
  { tarea: "Confirmar casa de retiro y pagar el anticipo", dia: -30, responsable: "Ecónomo", hecha: true },
  { tarea: "Pedir a los responsables los nombres para invitar", dia: -28, responsable: "Crecimiento", hecha: true },
  { tarea: "Abrir el formulario de inscripción", dia: -21, responsable: "Administrador CRM", hecha: true },
  { tarea: "Cerrar el menú y la lista de compras", dia: -7, responsable: "Cocina", hecha: false },
  { tarea: "Comprar el mercado", dia: -3, responsable: "Cocina", hecha: false },
  { tarea: "Asignar cabañas y grupos", dia: -2, responsable: "Coordinador", hecha: false },
  { tarea: "Imprimir libretas y manuales", dia: -2, responsable: "Materiales", hecha: false },
  { tarea: "Informe económico del retiro", dia: 7, responsable: "Ecónomo", hecha: false },
];

export const INVITADOS_TRIDUO = { propuestos: 64, invitados: 58, agendados: 41, confirmados: 36, inscritos: 31 };

// Datos SIMULADOS de la casa.
export const COWORKING_MIEMBROS = [
  { nombre: "[Miembro 1]", plan: "Mensual", desde: "2026-06-01", vence: "2026-11-01", pagado: false },
  { nombre: "[Miembro 2]", plan: "Mensual", desde: "2026-08-01", vence: "2026-11-30", pagado: true },
  { nombre: "[Miembro 3]", plan: "Mensual", desde: "2026-09-15", vence: "2026-11-15", pagado: true },
  { nombre: "[Miembro 4]", plan: "Por día", desde: "2026-10-28", vence: "2026-10-28", pagado: true },
  { nombre: "[Miembro 5]", plan: "Mensual", desde: "2026-10-01", vence: "2026-11-01", pagado: false },
];

export const INTERESADOS = {
  Contacto: ["[Interesado A] · Instagram", "[Interesado B] · WhatsApp", "[Interesado C] · Referido"],
  Visita: ["[Interesado D] · visita el 4 nov"],
  Prueba: ["[Interesado E] · día de prueba el 3 nov"],
  Miembro: ["[Miembro 5]"],
  "No concretó": ["[Interesado F] · precio", "[Interesado G] · horario"],
} as const;

/** Ventas simuladas del cafetín en octubre (USD), una por día de venta. */
export const VENTAS_CAFETIN_OCTUBRE = [38, 52, 41, 60, 35, 47, 55, 44, 39, 62, 58, 33, 49, 51, 45, 40, 57, 36, 48, 53];

export const INVENTARIO = [
  { closet: "Primer piso", division: "Misiones", articulo: "Carpas de 4 personas", cantidad: 6, prestado: null },
  { closet: "Primer piso", division: "Misiones", articulo: "Cavas", cantidad: 4, prestado: "Solidaridad · devolver 30 nov" },
  { closet: "Primer piso", division: "Catequesis", articulo: "Biblias", cantidad: 40, prestado: null },
  { closet: "Primer piso", division: "God's Plan", articulo: "Cornetas portátiles", cantidad: 2, prestado: "Search · vencido el 31 oct" },
  { closet: "Piso de arriba", division: "General", articulo: "Videobeam", cantidad: 1, prestado: null },
  { closet: "Piso de arriba", division: "Limpieza", articulo: "Desinfectante (galones)", cantidad: 3, prestado: null },
  { closet: "Piso de arriba", division: "Todos Uno", articulo: "Franelas talla M", cantidad: 25, prestado: null },
  { closet: "Piso de arriba", division: "Botiquín", articulo: "Botiquín de primeros auxilios", cantidad: 2, prestado: null },
  { closet: "Piso de arriba", division: "Objetos perdidos", articulo: "Suéter azul", cantidad: 1, prestado: null },
];

export const MANTENIMIENTO = [
  { titulo: "Aire acondicionado del Salón 3 no enfría", estado: "En proceso", fecha: "2026-10-29", costo: 45 },
  { titulo: "Bombillo fundido en la terraza", estado: "Reportado", fecha: "2026-10-31", costo: null },
  { titulo: "Fuga en el baño de la planta baja", estado: "Resuelto", fecha: "2026-10-12", costo: 30 },
];

export const LIMPIEZA = [
  { area: "Salones 1 a 5", hecho: true }, { area: "Baños", hecho: true }, { area: "Cafetín", hecho: false },
  { area: "Capilla", hecho: true }, { area: "Auditorio", hecho: false }, { area: "Terraza y jardines", hecho: false },
];

export const GASTOS_FIJOS = [
  { concepto: "Luz", monto: 38 }, { concepto: "Internet", monto: 45 }, { concepto: "Planta eléctrica (gasoil)", monto: 70 },
  { concepto: "Agua", monto: 15 }, { concepto: "Limpieza", monto: 120 },
];

/**
 * Cámaras de seguridad de la casa (simuladas).
 * Modelo instalado: YI Home 1080p (YYS.2016), con tarjeta microSD.
 * Integración prevista: ver /camaras, sección "Cómo se conectan".
 */
export type EstadoCamara = "en_linea" | "sin_conexion" | "grabando_sd";

export interface Camara {
  id: string;
  nombre: string;
  ubicacion: string;
  espacioId: string | null; // zona del mapa de la casa (espacio reservable o área común)
  planta: "baja" | "alta" | "auditorio";
  estado: EstadoCamara;
  sdUsadaGB: number;
  sdTotalGB: number;
  diasGrabados: number;
  ultimoMovimiento: string; // ISO
}

export const MODELO_CAMARA = { marca: "YI", modelo: "YI Home 1080p", codigo: "YYS.2016", resolucion: "1080p", almacenamiento: "microSD (hasta 64 GB)" };

export const CAMARAS: Camara[] = [
  { id: "c1", nombre: "Entrada principal", ubicacion: "Entrada, planta baja", espacioId: "entrada", planta: "baja", estado: "en_linea", sdUsadaGB: 41, sdTotalGB: 64, diasGrabados: 9, ultimoMovimiento: "2026-11-01T08:52:00" },
  { id: "c2", nombre: "Capilla", ubicacion: "Capilla, planta baja", espacioId: "cap", planta: "baja", estado: "en_linea", sdUsadaGB: 22, sdTotalGB: 32, diasGrabados: 11, ultimoMovimiento: "2026-11-01T07:30:00" },
  { id: "c3", nombre: "Pasillo de salones", ubicacion: "Pasillo central, planta alta", espacioId: "pasillo", planta: "alta", estado: "grabando_sd", sdUsadaGB: 60, sdTotalGB: 64, diasGrabados: 13, ultimoMovimiento: "2026-10-31T21:14:00" },
  { id: "c4", nombre: "Cafetín y estar", ubicacion: "Cafetín, planta baja", espacioId: "cafetin", planta: "baja", estado: "en_linea", sdUsadaGB: 18, sdTotalGB: 64, diasGrabados: 4, ultimoMovimiento: "2026-11-01T08:47:00" },
  { id: "c5", nombre: "Auditorio", ubicacion: "Auditorio", espacioId: "aud", planta: "auditorio", estado: "sin_conexion", sdUsadaGB: 0, sdTotalGB: 32, diasGrabados: 0, ultimoMovimiento: "2026-10-29T18:05:00" },
];

export const EVENTOS_CAMARAS = [
  { camaraId: "c1", fecha: "2026-11-01T08:52:00", tipo: "Movimiento", detalle: "Persona en la entrada" },
  { camaraId: "c4", fecha: "2026-11-01T08:47:00", tipo: "Movimiento", detalle: "Apertura del cafetín" },
  { camaraId: "c2", fecha: "2026-11-01T07:30:00", tipo: "Movimiento", detalle: "Limpieza de la capilla" },
  { camaraId: "c3", fecha: "2026-10-31T21:14:00", tipo: "Movimiento fuera de horario", detalle: "Pasillo de salones después de las 9:00 p. m." },
  { camaraId: "c5", fecha: "2026-10-29T18:05:00", tipo: "Sin conexión", detalle: "La cámara dejó de responder (revisar Wi-Fi o corriente)" },
  { camaraId: "c3", fecha: "2026-10-31T09:00:00", tipo: "Tarjeta casi llena", detalle: "microSD al 94 %: la cámara sobrescribe lo más antiguo" },
];

/** Horario en que la casa está abierta; fuera de él, el movimiento genera alerta. */
export const HORARIO_CASA = { abre: 7, cierra: 21 };

export function fueraDeHorario(isoFecha: string, horario = HORARIO_CASA) {
  const h = new Date(isoFecha).getHours();
  return h < horario.abre || h >= horario.cierra;
}

export function porcentajeSD(c: Pick<Camara, "sdUsadaGB" | "sdTotalGB">) {
  return c.sdTotalGB ? Math.round((c.sdUsadaGB / c.sdTotalGB) * 100) : 0;
}

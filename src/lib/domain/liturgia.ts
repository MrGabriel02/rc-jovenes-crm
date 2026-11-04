/**
 * Calendario litúrgico (rito romano, con las fiestas propias de Venezuela y las
 * que celebra el Regnum Christi). Calcula el tiempo litúrgico, el color y la
 * celebración del día sin depender de servicios externos.
 */
import { iso, sumarDias, soloFecha } from "./fechas";

export type Tiempo = "Adviento" | "Navidad" | "Cuaresma" | "Triduo Pascual" | "Pascua" | "Tiempo Ordinario";
export type Color = "morado" | "blanco" | "rojo" | "verde" | "rosa";
export type Rango = "solemnidad" | "fiesta" | "memoria" | "domingo" | "feria";

export interface Celebracion {
  nombre: string;
  rango: Rango;
  color: Color;
  /** Patrono o fiesta especial del Regnum Christi o de la sección. */
  rc?: boolean;
  /** Clave de la imagen en public/marca/fiestas (ver IMAGENES_FIESTAS). */
  imagen?: string;
}

export interface DiaLiturgico extends Celebracion {
  fecha: string;
  tiempo: Tiempo;
  semana: number | null;
}

/** Domingo de Pascua (algoritmo anónimo gregoriano). */
export function pascua(anio: number): Date {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

/** Primer domingo de Adviento: el cuarto domingo antes de Navidad. */
export function primerDomingoAdviento(anio: number): Date {
  const navidad = new Date(anio, 11, 25);
  const atras = navidad.getDay() === 0 ? 7 : navidad.getDay();
  return sumarDias(navidad, -atras - 21);
}

/** Bautismo del Señor: el domingo después del 6 de enero. */
function bautismo(anio: number): Date {
  const epif = new Date(anio, 0, 6);
  return sumarDias(epif, 7 - epif.getDay() || 7);
}

const FIJAS: Record<string, Celebracion> = {
  "01-01": { nombre: "Santa María, Madre de Dios", rango: "solemnidad", color: "blanco", imagen: "maria" },
  "01-03": { nombre: "Fundación del Regnum Christi (1941)", rango: "memoria", color: "blanco", rc: true },
  "01-06": { nombre: "Epifanía del Señor", rango: "solemnidad", color: "blanco" },
  "01-14": { nombre: "Divina Pastora", rango: "fiesta", color: "blanco", rc: true, imagen: "divina-pastora" },
  "01-25": { nombre: "Conversión de San Pablo", rango: "fiesta", color: "blanco", rc: true, imagen: "san-pablo" },
  "02-02": { nombre: "Presentación del Señor", rango: "fiesta", color: "blanco" },
  "03-19": { nombre: "San José, esposo de la Virgen María", rango: "solemnidad", color: "blanco", rc: true, imagen: "san-jose" },
  "03-25": { nombre: "Anunciación del Señor", rango: "solemnidad", color: "blanco", imagen: "maria" },
  "06-24": { nombre: "Natividad de San Juan Bautista", rango: "solemnidad", color: "blanco" },
  "06-29": { nombre: "San Pedro y San Pablo, apóstoles", rango: "solemnidad", color: "rojo", rc: true, imagen: "san-pablo" },
  "07-04": { nombre: "Beato Pier Giorgio Frassati", rango: "memoria", color: "blanco", rc: true },
  "08-06": { nombre: "Transfiguración del Señor", rango: "fiesta", color: "blanco" },
  "08-15": { nombre: "Asunción de la Virgen María", rango: "solemnidad", color: "blanco", imagen: "maria" },
  "09-08": { nombre: "Natividad de la Virgen María", rango: "fiesta", color: "blanco" },
  "09-11": { nombre: "Nuestra Señora de Coromoto, patrona de Venezuela", rango: "solemnidad", color: "blanco", rc: true, imagen: "coromoto" },
  "09-14": { nombre: "Exaltación de la Santa Cruz", rango: "fiesta", color: "rojo" },
  "09-15": { nombre: "Nuestra Señora de los Dolores", rango: "memoria", color: "blanco", rc: true, imagen: "dolorosa" },
  "09-29": { nombre: "Santos Arcángeles Miguel, Gabriel y Rafael", rango: "fiesta", color: "blanco" },
  "10-01": { nombre: "Santa Teresa del Niño Jesús", rango: "memoria", color: "blanco" },
  "10-04": { nombre: "San Francisco de Asís", rango: "memoria", color: "blanco" },
  "10-07": { nombre: "Nuestra Señora del Rosario", rango: "memoria", color: "blanco" },
  "10-12": { nombre: "San Carlo Acutis", rango: "memoria", color: "blanco", rc: true },
  "10-22": { nombre: "San Juan Pablo II", rango: "memoria", color: "blanco", rc: true },
  "11-01": { nombre: "Todos los Santos", rango: "solemnidad", color: "blanco", imagen: "todos-los-santos" },
  "11-02": { nombre: "Conmemoración de los fieles difuntos", rango: "memoria", color: "morado" },
  "11-04": { nombre: "San Carlos Borromeo", rango: "memoria", color: "blanco" },
  "11-30": { nombre: "San Andrés, apóstol", rango: "fiesta", color: "rojo" },
  "12-08": { nombre: "Inmaculada Concepción de la Virgen María", rango: "solemnidad", color: "blanco", rc: true, imagen: "inmaculada" },
  "12-12": { nombre: "Nuestra Señora de Guadalupe", rango: "fiesta", color: "blanco", rc: true, imagen: "guadalupe" },
  "12-25": { nombre: "Natividad del Señor", rango: "solemnidad", color: "blanco", imagen: "navidad" },
  "12-27": { nombre: "San Juan, apóstol y evangelista", rango: "fiesta", color: "blanco" },
};

/** Celebraciones que dependen de la Pascua (en Venezuela, Ascensión y Corpus pasan al domingo). */
function moviles(anio: number): Record<string, Celebracion> {
  const p = pascua(anio);
  const adv = primerDomingoAdviento(anio);
  const k = (d: Date) => iso(d);
  return {
    [k(bautismo(anio))]: { nombre: "Bautismo del Señor", rango: "fiesta", color: "blanco" },
    [k(sumarDias(p, -46))]: { nombre: "Miércoles de Ceniza", rango: "feria", color: "morado" },
    [k(sumarDias(p, -7))]: { nombre: "Domingo de Ramos", rango: "domingo", color: "rojo" },
    [k(sumarDias(p, -3))]: { nombre: "Jueves Santo", rango: "solemnidad", color: "blanco" },
    [k(sumarDias(p, -2))]: { nombre: "Viernes Santo de la Pasión del Señor", rango: "solemnidad", color: "rojo", imagen: "cruz" },
    [k(sumarDias(p, -1))]: { nombre: "Sábado Santo", rango: "solemnidad", color: "morado" },
    [k(p)]: { nombre: "Domingo de Resurrección", rango: "solemnidad", color: "blanco", imagen: "resurreccion" },
    [k(sumarDias(p, 7))]: { nombre: "Domingo de la Divina Misericordia", rango: "domingo", color: "blanco" },
    [k(sumarDias(p, 42))]: { nombre: "Ascensión del Señor", rango: "solemnidad", color: "blanco" },
    [k(sumarDias(p, 49))]: { nombre: "Pentecostés", rango: "solemnidad", color: "rojo", imagen: "pentecostes" },
    [k(sumarDias(p, 56))]: { nombre: "Santísima Trinidad", rango: "solemnidad", color: "blanco" },
    [k(sumarDias(p, 63))]: { nombre: "Santísimo Cuerpo y Sangre de Cristo", rango: "solemnidad", color: "blanco" },
    [k(sumarDias(p, 68))]: { nombre: "Sagrado Corazón de Jesús", rango: "solemnidad", color: "blanco", rc: true, imagen: "sagrado-corazon" },
    [k(sumarDias(adv, -7))]: { nombre: "Jesucristo, Rey del Universo", rango: "solemnidad", color: "blanco", rc: true, imagen: "cristo-rey" },
  };
}

const ROMANO = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX", "XXX", "XXXI", "XXXII", "XXXIII", "XXXIV"];

function tiempoDe(d: Date): { tiempo: Tiempo; semana: number | null } {
  const anio = d.getFullYear();
  const p = pascua(anio);
  const adv = primerDomingoAdviento(anio);
  const t = soloFecha(d).getTime();
  const semanaDesde = (inicio: Date) => Math.floor((t - soloFecha(inicio).getTime()) / (7 * 86_400_000)) + 1;
  if (t >= adv.getTime() && t < new Date(anio, 11, 25).getTime()) return { tiempo: "Adviento", semana: semanaDesde(adv) };
  if (t >= new Date(anio, 11, 25).getTime() || t <= bautismo(anio).getTime()) return { tiempo: "Navidad", semana: null };
  const ceniza = sumarDias(p, -46);
  if (t >= ceniza.getTime() && t < sumarDias(p, -3).getTime()) {
    return { tiempo: "Cuaresma", semana: t < sumarDias(ceniza, 4).getTime() ? null : semanaDesde(sumarDias(ceniza, 4)) };
  }
  if (t >= sumarDias(p, -3).getTime() && t < p.getTime()) return { tiempo: "Triduo Pascual", semana: null };
  if (t >= p.getTime() && t <= sumarDias(p, 49).getTime()) return { tiempo: "Pascua", semana: semanaDesde(p) };
  if (t < ceniza.getTime()) return { tiempo: "Tiempo Ordinario", semana: semanaDesde(bautismo(anio)) };
  // Después de Pentecostés se cuenta hacia atrás desde Cristo Rey (semana XXXIV).
  const cristoRey = sumarDias(adv, -7);
  const domingoDeSuSemana = sumarDias(d, -d.getDay()).getTime();
  return { tiempo: "Tiempo Ordinario", semana: 34 - Math.round((soloFecha(cristoRey).getTime() - domingoDeSuSemana) / (7 * 86_400_000)) };
}

const COLOR_TIEMPO: Record<Tiempo, Color> = {
  Adviento: "morado", Navidad: "blanco", Cuaresma: "morado", "Triduo Pascual": "rojo", Pascua: "blanco", "Tiempo Ordinario": "verde",
};

const deTiempo = (t: Tiempo) => (t === "Tiempo Ordinario" ? "del Tiempo Ordinario" : `de ${t}`);

export function diaLiturgico(fecha: Date | string): DiaLiturgico {
  const d = soloFecha(fecha);
  const clave = iso(d);
  const { tiempo, semana } = tiempoDe(d);
  const base = { fecha: clave, tiempo, semana };
  const movil = moviles(d.getFullYear())[clave];
  if (movil) return { ...base, ...movil };
  const fija = FIJAS[clave.slice(5)];
  // En Adviento, Cuaresma y Pascua, los domingos prevalecen sobre fiestas y memorias.
  const domingoFuerte = d.getDay() === 0 && ["Adviento", "Cuaresma", "Pascua"].includes(tiempo);
  if (fija && (fija.rango === "solemnidad" || (!domingoFuerte && (d.getDay() !== 0 || fija.rango === "fiesta")))) return { ...base, ...fija };
  if (d.getDay() === 0) {
    const rosa = (tiempo === "Adviento" && semana === 3) || (tiempo === "Cuaresma" && semana === 4);
    const nombre = semana ? `Domingo ${ROMANO[semana]} ${deTiempo(tiempo)}` : `Domingo ${deTiempo(tiempo)}`;
    return { ...base, nombre, rango: "domingo", color: rosa ? "rosa" : COLOR_TIEMPO[tiempo] };
  }
  const nombre = semana ? `Semana ${ROMANO[semana]} ${deTiempo(tiempo)}` : `Feria ${deTiempo(tiempo)}`;
  return { ...base, ...(fija ?? { nombre, rango: "feria" as const, color: COLOR_TIEMPO[tiempo] }) };
}

/** Siguiente solemnidad, fiesta o fiesta RC después de la fecha dada. */
export function proximaCelebracion(desde: Date | string, maxDias = 120): DiaLiturgico | null {
  for (let i = 1; i <= maxDias; i++) {
    const d = diaLiturgico(sumarDias(desde, i));
    if (d.rango === "solemnidad" || d.rango === "fiesta" || d.rc) return d;
  }
  return null;
}

/** Versículos del Evangelio y frases de santos; se elige uno por día. */
export const FRASES: { texto: string; cita: string }[] = [
  { texto: "Venga a nosotros tu Reino.", cita: "Mateo 6, 10" },
  { texto: "Yo soy el camino, la verdad y la vida.", cita: "Juan 14, 6" },
  { texto: "Vengan a mí todos los que están cansados y agobiados, y yo los aliviaré.", cita: "Mateo 11, 28" },
  { texto: "Ustedes son la luz del mundo.", cita: "Mateo 5, 14" },
  { texto: "Permanezcan en mi amor.", cita: "Juan 15, 9" },
  { texto: "Busquen primero el Reino de Dios y su justicia.", cita: "Mateo 6, 33" },
  { texto: "Yo estoy con ustedes todos los días, hasta el fin del mundo.", cita: "Mateo 28, 20" },
  { texto: "No tengan miedo.", cita: "Mateo 14, 27" },
  { texto: "Ámense unos a otros como yo los he amado.", cita: "Juan 13, 34" },
  { texto: "Vayan y hagan discípulos a todos los pueblos.", cita: "Mateo 28, 19" },
  { texto: "Señor, ¿a quién iremos? Tú tienes palabras de vida eterna.", cita: "Juan 6, 68" },
  { texto: "Hágase en mí según tu palabra.", cita: "Lucas 1, 38" },
  { texto: "Hagan lo que él les diga.", cita: "Juan 2, 5" },
  { texto: "Duc in altum: rema mar adentro.", cita: "Lucas 5, 4" },
  { texto: "Nos hiciste, Señor, para ti, y nuestro corazón está inquieto hasta que descanse en ti.", cita: "San Agustín" },
  { texto: "La Eucaristía es mi autopista al cielo.", cita: "San Carlo Acutis" },
  { texto: "¡Verso l'alto! Hacia lo alto.", cita: "Beato Pier Giorgio Frassati" },
  { texto: "No tengan miedo. ¡Abran de par en par las puertas a Cristo!", cita: "San Juan Pablo II" },
  { texto: "Sean lo que Dios quiere que sean y prenderán fuego al mundo.", cita: "Santa Catalina de Siena" },
  { texto: "Nada te turbe, nada te espante; solo Dios basta.", cita: "Santa Teresa de Jesús" },
  { texto: "En el atardecer de la vida seremos examinados en el amor.", cita: "San Juan de la Cruz" },
  { texto: "Predica el Evangelio en todo momento y, si es necesario, usa palabras.", cita: "Atribuida a San Francisco de Asís" },
  { texto: "Todo lo puedo en aquel que me fortalece.", cita: "Filipenses 4, 13" },
  { texto: "Ya no vivo yo, es Cristo quien vive en mí.", cita: "Gálatas 2, 20" },
];

/** Frase del día: fija por fecha, para que todos vean la misma. */
export function fraseDelDia(fecha: Date | string) {
  const d = soloFecha(fecha);
  const inicio = new Date(d.getFullYear(), 0, 0).getTime();
  const n = Math.floor((d.getTime() - inicio) / 86_400_000);
  return FRASES[n % FRASES.length];
}

/** Colores de pantalla para cada color litúrgico. */
export const TONO_LITURGICO: Record<Color, { fondo: string; texto: string; nombre: string }> = {
  morado: { fondo: "#5b2a86", texto: "#ffffff", nombre: "Morado" },
  blanco: { fondo: "#f4ead2", texto: "#5b3d00", nombre: "Blanco" },
  rojo: { fondo: "#a3222b", texto: "#ffffff", nombre: "Rojo" },
  verde: { fondo: "#2f6b3a", texto: "#ffffff", nombre: "Verde" },
  rosa: { fondo: "#d77a9d", texto: "#3a0d1f", nombre: "Rosa" },
};

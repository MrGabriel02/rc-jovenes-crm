// Datos SIMULADOS para la demo. Ningún nombre, cédula ni teléfono corresponde a una persona real.
import type {
  Actividad, Apostolado, DirectorEspiritual, Encuentro, Equipo, Espacio, MovimientoEconomico,
  Participacion, Persona, Reserva, Rol, SesionDE,
} from "../domain/types";
import type { SeguimientoPersona } from "../domain/seguimiento";

let semillaRnd = 20261101;
function rnd() {
  semillaRnd = (semillaRnd * 1664525 + 1013904223) % 4294967296;
  return semillaRnd / 4294967296;
}
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
const entre = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));

const NOMBRES_M = ["Andrés", "Daniel", "Diego", "Gabriel", "Javier", "José", "Juan", "Luis", "Manuel", "Mateo", "Miguel", "Pablo", "Ricardo", "Santiago", "Sebastián", "Tomás", "Samuel", "Emilio", "Joaquín", "Rafael"];
const NOMBRES_F = ["Ana", "Andrea", "Camila", "Carla", "Daniela", "Gabriela", "Isabel", "Laura", "Lucía", "María", "Mariana", "Paula", "Sofía", "Valentina", "Victoria", "Elena", "Natalia", "Alejandra", "Sara", "Teresa"];
const APELLIDOS = ["Álvarez", "Blanco", "Castillo", "Díaz", "Escalona", "Fernández", "García", "Gil", "Hernández", "Lameda", "López", "Martínez", "Méndez", "Mendoza", "Ortiz", "Pérez", "Ramírez", "Rivas", "Rodríguez", "Rojas", "Suárez", "Torres", "Vargas", "Yépez", "Zambrano"];
const ZONAS = ["Este", "Oeste", "Centro", "Cabudare", "Santa Rosa", "Nueva Segovia", "El Ujano", "Patarata"];
const PROFESIONES = ["Estudiante universitario", "Estudiante de bachillerato", "Ingeniería", "Medicina", "Administración", "Docente", "Diseño", "Derecho", "Comunicación social", "Emprendedor"];

export const personas: Persona[] = Array.from({ length: 160 }, (_, i) => {
  const sexo = rnd() < 0.5 ? "M" : "F";
  const nombre = pick(sexo === "M" ? NOMBRES_M : NOMBRES_F);
  const apellido = `${pick(APELLIDOS)} ${pick(APELLIDOS)}`;
  const anio = entre(1998, 2010);
  return {
    id: `p${i + 1}`,
    cedula: rnd() < 0.9 ? String(entre(24_000_000, 33_999_999)) : null,
    nombre,
    apellido,
    sexo,
    fechaNacimiento: `${anio}-${String(entre(1, 12)).padStart(2, "0")}-${String(entre(1, 28)).padStart(2, "0")}`,
    telefono: `04${pick(["12", "14", "16", "24", "26"])}-${entre(1_000_000, 9_999_999)}`,
    correo: `${nombre}.${apellido.split(" ")[0]}${i}@ejemplo.com`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
    zona: pick(ZONAS),
    profesion: pick(PROFESIONES),
    etiquetas: rnd() < 0.08 ? ["posible responsable"] : [],
    creadoEn: `20${entre(23, 26)}-0${entre(1, 9)}-15`,
  } satisfies Persona;
});

export const apostolados: Apostolado[] = [
  { id: "gpr", nombre: "God's Plan Retreat", descripcion: "Retiro de discernimiento", correo: "[correo del apostolado]", directorId: "p3", economoId: "p8" },
  { id: "search", nombre: "Search", descripcion: "Retiro para acercarse más a Dios", correo: "[correo del apostolado]", directorId: "p12", economoId: "p15" },
  { id: "todosuno", nombre: "Todos Uno", descripcion: "Peregrinación a la Virgen de Coromoto", correo: "[correo del apostolado]", directorId: "p20", economoId: "p21" },
  { id: "jfm", nombre: "Juventud y Familia Misionera", descripcion: "Mega Misiones y Misiones de Adviento en zonas rurales", correo: "[correo del apostolado]", directorId: "p25", economoId: "p26" },
  { id: "sd", nombre: "Soñar Despierto", descripcion: "Programas APS, CA, CTS, INT, ME, MM, VS y VV", correo: "[correo del apostolado]", directorId: "p30", economoId: "p31" },
  { id: "solidaridad", nombre: "Solidaridad", descripcion: "Rally con estaciones para personas de bajos recursos, con misa y confesión", correo: "[correo del apostolado]", directorId: "p33", economoId: "p34" },
  { id: "music", nombre: "MusicToChange", descripcion: "Música en misas, retiros y actividades", correo: "[correo del apostolado]", directorId: "p36", economoId: null },
  { id: "kerigma", nombre: "Kerigma", descripcion: "Retiro para jóvenes de catequesis de confirmación", correo: "[correo del apostolado]", directorId: "p40", economoId: "p41" },
  { id: "cruzadas", nombre: "Cruzadas", descripcion: "Restauración y construcción de capillas", correo: "[correo del apostolado]", directorId: "p44", economoId: "p45" },
  { id: "quodagis", nombre: "Quod Agis", descripcion: "Dios en la empresa y el trabajo", correo: "[correo del apostolado]", directorId: "p48", economoId: "p49" },
];

export const actividades: Actividad[] = [
  { id: "gpr23", nombre: "God's Plan Retreat 23", tipo: "retiro_apostolado", apostoladoId: "gpr", inicio: "2026-10-23", fin: "2026-10-25", lugar: "Casa de retiros", seguimientoPostRetiro: true, formularioConectado: { hojaId: "[id-hoja]", cuentaPropietaria: "[correo gpr]", mapeo: {}, ultimaSincronizacion: "2026-11-01T06:00:00" } },
  { id: "search25", nombre: "Search XXV", tipo: "retiro_apostolado", apostoladoId: "search", inicio: "2026-10-28", fin: "2026-10-30", lugar: "Casa de retiros", seguimientoPostRetiro: true, formularioConectado: { hojaId: "[id-hoja]", cuentaPropietaria: "[correo search]", mapeo: {}, ultimaSincronizacion: "2026-11-01T06:00:00" } },
  { id: "mega26", nombre: "Mega Misiones 2026", tipo: "retiro_apostolado", apostoladoId: "jfm", inicio: "2026-03-29", fin: "2026-04-05", lugar: "Zonas rurales de Lara", seguimientoPostRetiro: true },
  { id: "triduo26", nombre: "Triduo de renovación 2026", tipo: "retiro_seccion", apostoladoId: null, inicio: "2026-07-03", fin: "2026-07-05", lugar: "Casa de retiros", seguimientoPostRetiro: false },
  { id: "ee26", nombre: "Ejercicios Espirituales 2026", tipo: "retiro_seccion", apostoladoId: null, inicio: "2026-02-13", fin: "2026-02-15", lugar: "Casa de retiros", seguimientoPostRetiro: false },
  { id: "todosuno5", nombre: "Todos Uno, peregrinación 5", tipo: "retiro_apostolado", apostoladoId: "todosuno", inicio: "2026-09-12", fin: "2026-09-13", lugar: "Guanare", seguimientoPostRetiro: true },
  { id: "he-nov", nombre: "Hora eucarística", tipo: "hora_eucaristica", apostoladoId: null, inicio: "2026-11-06T19:00:00", fin: "2026-11-06T20:00:00", lugar: "Capilla", seguimientoPostRetiro: false },
  { id: "charla-nov", nombre: "Charla de formación de noviembre", tipo: "charla_formacion", apostoladoId: null, inicio: "2026-11-15T16:00:00", fin: "2026-11-15T18:00:00", lugar: "Auditorio", seguimientoPostRetiro: false },
  { id: "circulo-nov", nombre: "Círculo de estudio", tipo: "circulo_estudio", apostoladoId: null, inicio: "2026-11-11T19:00:00", fin: "2026-11-11T20:30:00", lugar: "Sala de conferencias", seguimientoPostRetiro: false },
  { id: "vfc26", nombre: "VFC 2026", tipo: "vfc", apostoladoId: null, inicio: "2026-11-21", fin: "2026-11-23", lugar: "[por definir]", seguimientoPostRetiro: false },
  { id: "adviento26", nombre: "Misiones de Adviento 2026", tipo: "retiro_apostolado", apostoladoId: "jfm", inicio: "2026-12-05", fin: "2026-12-07", lugar: "[comunidad por definir]", seguimientoPostRetiro: true },
  { id: "solidaridad-nov", nombre: "Rally Solidaridad", tipo: "retiro_apostolado", apostoladoId: "solidaridad", inicio: "2026-11-29", fin: "2026-11-29", lugar: "[comunidad por definir]", seguimientoPostRetiro: false },
  { id: "search26", nombre: "Search XXVI", tipo: "retiro_apostolado", apostoladoId: "search", inicio: "2027-02-26", fin: "2027-02-28", lugar: "[por definir]", seguimientoPostRetiro: true },
];

// Participaciones simuladas
export const participaciones: Participacion[] = [];
const cupo: Record<string, [number, number]> = { gpr23: [0, 48], search25: [40, 79], mega26: [10, 140], triduo26: [0, 51], ee26: [5, 51], todosuno5: [60, 96], adviento26: [90, 119] };
for (const [act, [desde, hasta]] of Object.entries(cupo)) {
  for (let i = desde; i < hasta && i < personas.length; i++) {
    const servidor = rnd() < 0.12;
    const monto = act === "adviento26" ? 25 : 40;
    const abonado = entre(0, monto);
    participaciones.push({
      id: `${act}-${i}`, personaId: personas[i].id, actividadId: act, rol: servidor ? "servidor" : "participante",
      montoInscripcion: monto, abonos: abonado ? [{ fecha: "2026-10-20", monto: abonado, moneda: "USD", metodo: pick(["zelle", "efectivo", "pago_movil"] as const) }] : [],
      checkIn: act !== "adviento26",
    });
  }
}

// Seguimiento post retiro de los dos retiros recientes
export const seguimientos: SeguimientoPersona[] = participaciones
  .filter((p) => (p.actividadId === "gpr23" || p.actividadId === "search25") && p.rol === "participante")
  .map((p) => {
    const gpr = p.actividadId === "gpr23";
    const r = rnd();
    return {
      personaId: p.personaId,
      actividadId: p.actividadId,
      pasos: gpr
        ? { grupo: "enviado", ofrecer_de: r < 0.45 ? "respondio" : "enviado", ofrecer_equipo: r < 0.3 ? "respondio" : r < 0.6 ? "enviado" : "pendiente", misa: "enviado" }
        : { grupo: "enviado" },
      aceptoDE: gpr && r < 0.45,
      aceptoEquipo: gpr && r < 0.3,
    } satisfies SeguimientoPersona;
  });

export const NOMBRES_EQUIPOS = ["San José", "Pier Giorgio", "Juan Pablo II", "Carlo Acutis", "San Miguel", "Guadalupe", "Santa Teresa", "San Francisco", "Santa María", "Chiara Badano", "San Agustín", "Santa Clara"];
export const equipos: Equipo[] = NOMBRES_EQUIPOS.map((nombre, i) => {
  const base = i * 9;
  return { id: `eq${i + 1}`, nombre, responsableId: personas[base].id, miembros: personas.slice(base + 1, base + 9).map((p) => p.id), activo: true };
});

// 8 semanas de encuentros por equipo
export const encuentros: Encuentro[] = [];
for (const eq of equipos) {
  const tasa = 0.6 + rnd() * 0.35;
  for (let s = 0; s < 8; s++) {
    const d = new Date("2026-09-09T19:00:00");
    d.setDate(d.getDate() + s * 7);
    const asistentes = eq.miembros.filter((m, idx) => {
      if (eq.id === "eq1" && idx === 2 && s >= 4) return false; // 4 faltas seguidas
      if (eq.id === "eq2" && idx < 2 && s >= 6) return false; // 2 faltas seguidas
      return rnd() < tasa;
    });
    encuentros.push({ id: `${eq.id}-${s}`, equipoId: eq.id, fecha: d.toISOString().slice(0, 10), programado: s % 3 !== 2, asistentes });
  }
}

export const directores: DirectorEspiritual[] = [
  { id: "de1", nombre: "P. [Nombre], L.C.", tipo: "sacerdote", correoCalendario: "[correo]", tituloAgenda: "Dirección espiritual", enlaceAgenda: "https://calendar.app.google/[agenda-1]" },
  { id: "de2", nombre: "[Director laico 1]", tipo: "laico", correoCalendario: "[correo]", tituloAgenda: "Dirección espiritual", enlaceAgenda: "https://calendar.app.google/[agenda-2]" },
  { id: "de3", nombre: "[Director laico 2]", tipo: "laico", correoCalendario: "[correo]", tituloAgenda: "Dirección espiritual", enlaceAgenda: "https://calendar.app.google/[agenda-3]" },
];

export const sesionesDE: SesionDE[] = [];
{
  let n = 0;
  for (const eq of equipos) {
    for (const m of [eq.responsableId, ...eq.miembros]) {
      if (rnd() < 0.25) continue; // sin DE
      const dir = pick(directores).id;
      let d = new Date(`2026-0${entre(4, 6)}-${String(entre(1, 28)).padStart(2, "0")}T17:00:00`);
      while (d < new Date("2026-11-01")) {
        sesionesDE.push({ id: `de-${n++}`, personaId: m, directorId: dir, inicio: d.toISOString().slice(0, 19), estado: rnd() < 0.9 ? "realizada" : "no_realizada", origen: rnd() < 0.8 ? "agenda_citas" : "manual" });
        d = new Date(d.getTime() + entre(25, 75) * 86_400_000);
      }
    }
  }
  // un caso de 3 meses sin DE y citas por confirmar
  sesionesDE.push({ id: `de-${n++}`, personaId: "p3", directorId: "de1", inicio: "2026-07-28T17:00:00", estado: "realizada", origen: "agenda_citas" });
  sesionesDE.push({ id: `de-${n++}`, personaId: "p5", directorId: "de2", inicio: "2026-10-31T16:00:00", estado: "agendada", origen: "agenda_citas" });
  sesionesDE.push({ id: `de-${n++}`, personaId: "p11", directorId: "de1", inicio: "2026-10-30T17:30:00", estado: "agendada", origen: "agenda_citas" });
  sesionesDE.push({ id: `de-${n++}`, personaId: "p14", directorId: "de3", inicio: "2026-11-04T18:00:00", estado: "agendada", origen: "agenda_citas" });
}

const TASA = 365; // Bs por USD, simulada
const CATS_GASTO = ["Alimentación", "Alquiler de casa de retiro", "Materiales", "Transporte", "Servicios"];
export const movimientos: MovimientoEconomico[] = [];
{
  let n = 0;
  const meses = ["05", "06", "07", "08", "09", "10"];
  const areas = ["jfm", "search", "gpr", "todosuno", "sd", "solidaridad", "kerigma", "seccion", "casa"];
  for (const mes of meses) {
    for (const area of areas) {
      const ingresos = area === "casa" ? entre(250, 450) : entre(80, 700) * (mes === "07" && area === "seccion" ? 4 : 1);
      const enDolares = rnd() < 0.5;
      movimientos.push({ id: `m${n++}`, fecha: `2026-${mes}-0${entre(1, 9)}`, tipo: "ingreso", categoria: area === "casa" ? "Alquiler de espacios" : "Inscripciones", descripcion: "Ingresos del mes", monto: enDolares ? ingresos : ingresos * TASA, moneda: enDolares ? "USD" : "VES", tasaBCV: TASA, metodo: "transferencia", custodio: area === "casa" ? "Cuenta de la sección" : rnd() < 0.3 ? "Cuenta personal de un integrante" : "Cuenta del apostolado", areaId: area, actividadId: null });
      for (let k = 0; k < 2; k++) {
        const g = Math.round(ingresos * (0.2 + rnd() * 0.22));
        movimientos.push({ id: `m${n++}`, fecha: `2026-${mes}-1${entre(0, 9)}`, tipo: "gasto", categoria: area === "casa" ? pick(["Luz", "Internet", "Planta eléctrica", "Agua", "Limpieza"]) : pick(CATS_GASTO), descripcion: "Gasto del mes", monto: g * TASA, moneda: "VES", tasaBCV: TASA, metodo: pick(["transferencia", "pago_movil", "efectivo"] as const), custodio: rnd() < 0.15 ? "Cuenta personal de un integrante" : "Cuenta del apostolado", areaId: area, actividadId: null });
      }
    }
  }
}
export const TASA_BCV_HOY = TASA;

export const espacios: Espacio[] = [
  { id: "s1", nombre: "Salón 1", tipo: "salon_comun", capacidad: 6 },
  { id: "s2", nombre: "Salón 2", tipo: "salon_comun", capacidad: 10 },
  { id: "s3", nombre: "Salón 3", tipo: "salon_comun", capacidad: 12 },
  { id: "s4", nombre: "Salón 4", tipo: "salon_comun", capacidad: 10 },
  { id: "s5", nombre: "Salón 5", tipo: "salon_comun", capacidad: 10 },
  { id: "conf", nombre: "Sala de conferencias", tipo: "conferencias", capacidad: 14 },
  { id: "aud", nombre: "Auditorio", tipo: "auditorio", capacidad: 144 },
  { id: "ter", nombre: "Terraza", tipo: "terraza", capacidad: 90 },
  { id: "cap", nombre: "Capilla", tipo: "capilla", capacidad: null },
];

export const DIRECTORES_SECCION = ["dir1", "dir2"];
export const reservas: Reserva[] = [
  { id: "r1", espacioId: "s2", inicio: "2026-11-01T19:00:00", bloques: 1, solicitante: "Equipo San José", tipoSolicitante: "apostolado", responsable: "Responsable del equipo", telefono: "", motivo: "Encuentro semanal", aprobaciones: ["dir1", "dir2"], recurrente: "semanal" },
  { id: "r2", espacioId: "conf", inicio: "2026-11-04T18:00:00", bloques: 2, solicitante: "Sección Señores", tipoSolicitante: "otra_seccion", responsable: "[responsable]", telefono: "", motivo: "Reunión de consejo", aprobaciones: ["dir1"] },
  { id: "r3", espacioId: "aud", inicio: "2026-11-15T16:00:00", bloques: 2, solicitante: "Formación", tipoSolicitante: "apostolado", responsable: "Coordinador de formación", telefono: "", motivo: "Charla mensual", aprobaciones: ["dir1", "dir2"] },
  { id: "r4", espacioId: "ter", inicio: "2026-11-08T10:00:00", bloques: 3, solicitante: "[empresa externa]", tipoSolicitante: "externo", responsable: "[contacto]", telefono: "", motivo: "Taller de networking", aprobaciones: [], pagado: false },
  { id: "r5", espacioId: "cap", inicio: "2026-11-06T19:00:00", bloques: 1, solicitante: "Sección Jóvenes", tipoSolicitante: "apostolado", responsable: "Integración", telefono: "", motivo: "Hora eucarística", aprobaciones: ["dir1", "dir2"] },
  { id: "r6", espacioId: "s4", inicio: "2026-11-03T19:00:00", bloques: 1, solicitante: "Search", tipoSolicitante: "apostolado", responsable: "Director de Search", telefono: "", motivo: "Reunión del equipo organizador", aprobaciones: ["dir2"] },
];

export const roles: Rol[] = [
  { id: "admin", nombre: "Administrador CRM", alcance: "todo", permisos: Object.fromEntries((["inicio", "personas", "calendario", "seguimiento", "equipos", "direccion", "apostolados", "formacion", "retiros", "economia", "casa", "camaras", "comunicaciones", "documentos", "configuracion"] as const).map((m) => [m, "editar"])) },
  { id: "director", nombre: "Director de sección", alcance: "todo", permisos: { inicio: "leer", personas: "leer", calendario: "editar", seguimiento: "leer", equipos: "editar", direccion: "leer", apostolados: "editar", formacion: "leer", retiros: "leer", economia: "leer", casa: "editar", camaras: "leer", documentos: "leer" } },
  { id: "crecimiento", nombre: "Encargado de crecimiento", alcance: "todo", permisos: { inicio: "leer", personas: "editar", seguimiento: "editar", equipos: "editar", direccion: "leer", calendario: "leer" } },
  { id: "responsable", nombre: "Responsable de equipo", alcance: "equipo", permisos: { equipos: "editar", calendario: "leer", retiros: "leer" } },
  { id: "director_de", nombre: "Director espiritual", alcance: "dirigidos", permisos: { direccion: "editar" } },
  { id: "economo", nombre: "Ecónomo de apostolado", alcance: "apostolado", permisos: { economia: "editar", apostolados: "leer", documentos: "editar" } },
  { id: "reservas", nombre: "Encargado de reservas y coworking", alcance: "todo", permisos: { casa: "editar", calendario: "leer" } },
  { id: "mantenimiento", nombre: "Encargado de mantenimiento", alcance: "todo", permisos: { casa: "editar", camaras: "editar" } },
  { id: "formacion", nombre: "Coordinador de formación", alcance: "todo", permisos: { formacion: "editar", calendario: "editar" } },
];

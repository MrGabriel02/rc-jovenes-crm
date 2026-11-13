import { FileSpreadsheet, RefreshCw, Send } from "lucide-react";
import { BotonAccion } from "@/components/accion";
import { AvisoSimulado, BarrasLista, Badge, Card, Grid, Kpi, PageHeader, LinkButton } from "@/components/ui";
import { Columnas } from "@/components/charts";
import { TablaPersonas, type FilaPersona } from "./tabla";
import { db, formadores, historialPersona, personasConResumen } from "@/lib/data/repo";
import { FORMULARIOS_SINCRONIZADOS, RESPUESTAS_CRM, distribucion } from "@/lib/data/crm";
import { HOY, edad, fechaCorta, mesesEntre } from "@/lib/domain/fechas";

export const metadata = { title: "Personas" };

const CAMPOS: [keyof FilaPersona, string][] = [["cedula", "Cédula"], ["telefono", "Teléfono"], ["correo", "Correo"], ["profesion", "Profesión"], ["edad", "Fecha de nacimiento"]];

export default function Personas() {
  const cargos = new Map(formadores().map((f) => [f.persona.id, f.cargo]));
  const resumen = personasConResumen();
  const filas: FilaPersona[] = resumen.map((p) => {
    const hist = historialPersona(p.id);
    const fila = {
      id: p.id, nombre: p.nombreCompleto, cedula: p.cedula, telefono: p.telefono, correo: p.correo, zona: p.zona, profesion: p.profesion,
      sexo: p.sexo, edad: p.fechaNacimiento ? edad(p.fechaNacimiento, HOY) : null, estado: p.estado, formador: cargos.get(p.id) ?? null,
      actividades: p.actividades, servicios: p.servicios, equipo: p.equipo, ultimaDE: p.ultimaDE,
      asistio: hist.filter((h) => h.rol === "participante").map((h) => h.actividadId),
      sirvio: hist.filter((h) => h.rol !== "participante").map((h) => h.actividadId),
      faltan: [] as string[],
    };
    fila.faltan = CAMPOS.filter(([k]) => fila[k] === null || fila[k] === "").map(([, l]) => l);
    return fila;
  });

  const haceVida = filas.filter((p) => p.estado === "hace_vida").length;
  const conFaltantes = filas.filter((f) => f.faltan.length);
  const edades = filas.map((f) => f.edad).filter((e): e is number => e !== null);
  const porEdad = ([["16-18", 16, 18], ["19-22", 19, 22], ["23-26", 23, 26], ["27+", 27, 99]] as const).map(([r, a, b]) => ({ rango: r, personas: edades.filter((e) => e >= a && e <= b).length }));
  const profesiones = [...new Set(filas.map((f) => f.profesion).filter(Boolean) as string[])].sort();
  const porProfesion = profesiones.map((p) => ({ etiqueta: p, n: filas.filter((f) => f.profesion === p).length })).sort((a, b) => b.n - a.n).slice(0, 6);
  const r = RESPUESTAS_CRM;
  const sino = (xs: boolean[]) => [{ etiqueta: "Sí", n: xs.filter(Boolean).length }, { etiqueta: "No", n: xs.filter((x) => !x).length }];
  const viejas = r.filter((x) => mesesEntre(x.respondidoEn, HOY) >= 12).length;
  const sinResponder = filas.length - r.length;
  const actividades = db.actividades.filter((a) => db.participaciones.some((p) => p.actividadId === a.id)).map((a) => ({ id: a.id, nombre: a.nombre }));

  return (
    <>
      <PageHeader
        title="Personas"
        description="Base general: una ficha por persona con todo lo que ha hecho, sea caminante, servidor, responsable o formador."
        actions={<><LinkButton href="#formularios" variant="secondary"><FileSpreadsheet size={16} aria-hidden />Formularios sincronizados</LinkButton><BotonAccion hecho="Formularios al día"><RefreshCw size={16} aria-hidden />Sincronizar ahora</BotonAccion></>}
      />
      <AvisoSimulado />
      <Grid min={180}>
        <Kpi label="Personas en la base" value={filas.length} note="De todos los formularios" />
        <Kpi label="Hacen vida en la sección" value={haceVida} />
        <Kpi label="Han pasado" value={filas.length - haceVida} note="Fueron a alguna actividad" />
        <Kpi label="Formadores" value={cargos.size} note="ICAFE, responsables y directores" />
        <Kpi label="Datos faltantes" value={conFaltantes.length} tone="warn" note="Se piden en la próxima inscripción" />
      </Grid>
      <Card title="Todas las personas" subtitle="Filtra por retiro, género, edad o profesión. La edad se calcula sola con la fecha de nacimiento.">
        <TablaPersonas filas={filas} actividades={actividades} profesiones={profesiones} />
      </Card>

      <h2 className="text-lg font-extrabold">Cómo es la base</h2>
      <Grid min={300}>
        <Card title="Género"><BarrasLista datos={[{ etiqueta: "Hombres", n: filas.filter((f) => f.sexo === "M").length }, { etiqueta: "Mujeres", n: filas.filter((f) => f.sexo === "F").length }]} /></Card>
        <Card title="Edad" subtitle={`Promedio: ${Math.round(edades.reduce((a, b) => a + b, 0) / edades.length)} años`}>
          <Columnas data={porEdad} x="rango" y="personas" nombre="Personas" alto={180} />
        </Card>
        <Card title="Profesión u ocupación" subtitle="Las 6 más comunes"><BarrasLista datos={porProfesion} total={filas.length} /></Card>
      </Grid>

      <h2 className="text-lg font-extrabold">Respuestas del formulario CRM <span className="text-sm font-semibold text-muted">· {r.length} respuestas</span></h2>
      <Grid min={260}>
        <Card title="¿Tiene director espiritual?"><BarrasLista datos={sino(r.map((x) => x.tieneDE))} /></Card>
        <Card title="¿Está en un equipo de encuentro?"><BarrasLista datos={sino(r.map((x) => x.enEquipo))} /></Card>
        <Card title="¿Está en un apostolado?"><BarrasLista datos={sino(r.map((x) => x.enApostolado))} /></Card>
        <Card title="¿Es miembro de la federación RC?"><BarrasLista datos={distribucion(r.map((x) => x.federacion), ["Sí", "Me gustaría asociarme", "No"] as const)} /></Card>
        <Card title="Nivel de compromiso"><BarrasLista datos={distribucion(r.map((x) => x.compromiso), ["Varias veces por semana", "Semanal", "Mensual", "Ocasional"] as const)} /></Card>
        <Card title="¿Le gustaría liderar?"><BarrasLista datos={distribucion(r.map((x) => x.liderazgo), ["Sí", "Tal vez", "No"] as const)} /></Card>
        <Card title="¿Por dónde recibe información?"><BarrasLista datos={distribucion(r.map((x) => x.infoPor), ["WhatsApp", "Ambos", "Correo", "Ninguno"] as const)} /></Card>
        <Card title="Quieren dar un paso más" subtitle="Contactar primero a estos">
          <BarrasLista total={r.length} datos={[
            { etiqueta: "Sin DE y quieren tenerla", n: r.filter((x) => !x.tieneDE && x.quiereDE).length },
            { etiqueta: "Sin equipo y quieren uno", n: r.filter((x) => !x.enEquipo && x.quiereEquipo).length },
            { etiqueta: "Quieren asociarse", n: r.filter((x) => x.federacion === "Me gustaría asociarme").length },
          ]} />
        </Card>
      </Grid>

      <Grid min={340}>
        <Card id="actualizar" title="Actualizar el formulario CRM" subtitle="El formulario se hizo hace dos años: muchos datos ya cambiaron">
          <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
            <dt className="text-ink-2">Respondieron hace más de un año</dt><dd className="font-bold tabular-nums">{viejas}</dd>
            <dt className="text-ink-2">Nunca respondieron</dt><dd className="font-bold tabular-nums">{sinResponder}</dd>
            <dt className="text-ink-2">Al día (último año)</dt><dd className="font-bold tabular-nums">{r.length - viejas}</dd>
          </dl>
          <p className="text-sm text-ink-2">Cada persona recibe un enlace personal que abre su ficha ya llena: solo corrige lo que cambió y confirma. Quien no responde recibe un recordatorio a los 7 días.</p>
          <BotonAccion hecho={`Enlace enviado a ${viejas + sinResponder} personas`}><Send size={16} aria-hidden />Enviar enlace de actualización a {viejas + sinResponder} personas</BotonAccion>
        </Card>
        <Card id="formularios" title="Formularios sincronizados" subtitle="Todas las respuestas se juntan en una hoja de Sheets: una pestaña general y una por apostolado">
          <details className="group rounded-xl border border-border">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between px-3 text-sm font-semibold">{FORMULARIOS_SINCRONIZADOS.length} formularios conectados <span className="text-xs text-muted group-open:hidden">Ver lista</span></summary>
            <ul className="flex flex-col border-t border-border">
              {FORMULARIOS_SINCRONIZADOS.map((f) => (
                <li key={f.nombre} className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm last:border-0">
                  <span className="flex flex-col"><strong>{f.nombre}</strong><span className="text-xs text-muted">{f.apostolado} · {f.respuestas} respuestas</span></span>
                  <Badge tone="good">Al día {fechaCorta(`${f.ultima}T12:00:00`)}</Badge>
                </li>
              ))}
            </ul>
          </details>
          <LinkButton href="https://docs.google.com/spreadsheets/" external variant="secondary"><FileSpreadsheet size={16} aria-hidden />Abrir la base general en Sheets</LinkButton>
        </Card>
        <Card title="Datos faltantes" subtitle="Se piden solos la próxima vez que la persona se inscriba a algo">
          <BarrasLista total={filas.length} datos={CAMPOS.map(([k, l]) => ({ etiqueta: l, n: filas.filter((f) => f[k] === null || f[k] === "").length }))} />
        </Card>
      </Grid>
    </>
  );
}

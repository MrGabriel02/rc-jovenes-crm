import { AvisoSimulado, Badge, Card, Grid, PageHeader, Table, LinkButton } from "@/components/ui";
import { NOMBRE_OBLIGATORIA, OBLIGATORIAS_FORMADOR, evaluarFormador, type Obligatoria } from "@/lib/domain/formadores";
import { db, nombreCompleto, persona } from "@/lib/data/repo";

export const metadata = { title: "Formación" };

const PONENTES = [
  { nombre: "[Ponente 1]", temas: ["Teología del cuerpo", "Afectividad"], charlas: 3, ultima: "2026-06-14" },
  { nombre: "[Ponente 2]", temas: ["Doctrina social de la Iglesia"], charlas: 1, ultima: "2026-03-21" },
  { nombre: "[Ponente 3]", temas: ["Biblia", "Lectio divina"], charlas: 2, ultima: "2026-09-13" },
  { nombre: "[Ponente 4]", temas: ["Vocación y discernimiento"], charlas: 2, ultima: "2026-10-18" },
];
const CHARLAS = [
  { mes: "Noviembre 2026", fecha: "Sáb 15 nov", tema: "[Tema por definir]", ponente: null },
  { mes: "Diciembre 2026", fecha: "Sáb 13 dic", tema: "Adviento: esperar con esperanza", ponente: "[Ponente 3]" },
  { mes: "Enero 2027", fecha: "Sáb 17 ene", tema: "[Tema por definir]", ponente: null },
];

export default function Formacion() {
  const formadores = db.equipos.map((e) => e.responsableId);
  const asistencias: Record<string, Partial<Record<Obligatoria, boolean>>> = Object.fromEntries(
    formadores.map((f, i) => [f, { retiro_anual: i % 5 !== 3, vfc: i % 4 !== 1, fin_semana_formadores: i % 3 !== 2 && i !== 7 }]),
  );
  asistencias[formadores[7]] = { retiro_anual: false, vfc: false, fin_semana_formadores: false };
  const realizadas = [...OBLIGATORIAS_FORMADOR];

  return (
    <>
      <PageHeader title="Formación" description="Charla mensual con banco de ponentes, círculos de estudio y seguimiento de formadores." actions={<LinkButton href="#">Agregar ponente</LinkButton>} />
      <AvisoSimulado />
      <Grid min={360}>
        <Card title="Próximas charlas mensuales">
          <ul className="flex flex-col gap-2">
            {CHARLAS.map((c) => (
              <li key={c.mes} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 p-3 text-sm">
                <span className="flex flex-col"><strong>{c.fecha}</strong><span className="text-xs text-muted">{c.tema}</span></span>
                {c.ponente ? <Badge tone="good">{c.ponente}</Badge> : <Badge tone="warn">Asignar ponente</Badge>}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Banco de ponentes">
          <Table head={["Ponente", "Temas", "Charlas", "Última"]} minWidth={420}>
            {PONENTES.map((p) => (
              <tr key={p.nombre}><td className="font-semibold">{p.nombre}</td><td>{p.temas.join(", ")}</td><td>{p.charlas}</td><td>{new Date(`${p.ultima}T12:00:00`).toLocaleDateString("es-VE")}</td></tr>
            ))}
          </Table>
        </Card>
      </Grid>
      <Card title="Formadores: actividades obligatorias del año" subtitle="Cada falta avisa al encargado del CRM. Si no asiste a ninguna en el año, se propone su destitución al director de sección.">
        <Table head={["Formador", ...realizadas.map((r) => NOMBRE_OBLIGATORIA[r]), "Estado"]} minWidth={640}>
          {formadores.map((f) => {
            const ev = evaluarFormador(asistencias[f], realizadas);
            return (
              <tr key={f}>
                <td className="font-semibold">{nombreCompleto(persona(f))}</td>
                {realizadas.map((r) => <td key={r}>{asistencias[f][r] ? <span className="text-good-ink">Asistió</span> : <span className="text-warn-ink">Faltó</span>}</td>)}
                <td>{ev.proponerDestitucion ? <Badge tone="warn">Proponer destitución</Badge> : ev.faltas.length ? <Badge tone="accent">{ev.faltas.length} falta{ev.faltas.length > 1 ? "s" : ""}</Badge> : <Badge tone="good">Al día</Badge>}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}

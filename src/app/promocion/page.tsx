import { Lightbulb } from "lucide-react";
import { AvisoSimulado, Badge, Card, Grid, Kpi, PageHeader } from "@/components/ui";
import { db, nombreCompleto, persona } from "@/lib/data/repo";
import { EMBAJADORES_PARROQUIA, GRUPOS_VOLUNTARIOS, LUGARES, PROMOCIONES, SUGERENCIAS_PROMOCION } from "@/lib/data/promocion";
import { Directorio, EnviarFlyer, NuevoEmbajador, type FilaLugar } from "./componentes";

export const metadata = { title: "Promoción" };

const nom = (id: string) => nombreCompleto(persona(id));
const lugar = (id: string) => LUGARES.find((l) => l.id === id)!;

export default function Promocion() {
  const filas: FilaLugar[] = LUGARES.map((l) => ({ id: l.id, tipo: l.tipo, nombre: l.nombre, zona: l.zona, contacto: l.contacto, embajadores: l.embajadores.map(nom), ultimaVisita: l.ultimaVisita, jovenes: l.jovenesAlcanzados, notas: l.notas }));
  const embajadores = new Set([...LUGARES.flatMap((l) => l.embajadores), ...EMBAJADORES_PARROQUIA.map((e) => e.personaId)]);
  const sinEmbajador = LUGARES.filter((l) => !l.embajadores.length).length;
  const alcanzados = LUGARES.reduce((a, l) => a + l.jovenesAlcanzados, 0);
  const candidatos = db.personas.slice(0, 60).map((p) => ({ id: p.id, nombre: nombreCompleto(p) }));
  const apostolado = (id: string) => db.apostolados.find((a) => a.id === id)?.nombre ?? id;

  return (
    <>
      <PageHeader title="Promoción" description="Dónde se invita a los jóvenes, quién lo hace y cómo va cada convocatoria." />
      <AvisoSimulado />
      <Grid min={180}>
        <Kpi label="Lugares en el directorio" value={LUGARES.length} note={`${LUGARES.filter((l) => l.tipo === "Colegio").length} colegios · ${LUGARES.filter((l) => l.tipo === "Parroquia").length} parroquias`} />
        <Kpi label="Embajadores" value={embajadores.size} />
        <Kpi label="Lugares sin embajador" value={sinEmbajador} tone={sinEmbajador ? "warn" : "neutral"} />
        <Kpi label="Jóvenes alcanzados" value={alcanzados} note="Este año, por visitas y charlas" />
      </Grid>

      <Card title="Sugerencias" subtitle="Salen de las visitas, las metas y los lugares sin embajador">
        <ul className="flex flex-col gap-2">
          {SUGERENCIAS_PROMOCION.map((s) => <li key={s} className="flex gap-2 text-sm"><Lightbulb size={16} aria-hidden className="mt-0.5 shrink-0 text-[var(--gold)]" />{s}</li>)}
        </ul>
      </Card>

      <h2 className="text-lg font-extrabold">Promociones en curso</h2>
      <Grid min={300}>
        {PROMOCIONES.map((p) => {
          const pct = Math.round((p.inscritos / p.meta) * 100);
          return (
            <Card key={p.id} title={p.nombre} subtitle={`${apostolado(p.apostoladoId)} · ${new Date(`${p.fecha}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "long" })}`} action={<Badge tone={pct >= 70 ? "good" : pct >= 40 ? "accent" : "warn"}>{pct}%</Badge>}>
              <div className="flex flex-col gap-1">
                <span className="text-sm"><strong className="tabular-nums">{p.inscritos}</strong> de {p.meta} inscritos</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: "var(--series-1)" }} /></span>
              </div>
              <ul className="flex flex-col">
                {p.embajadores.map((e) => (
                  <li key={e.personaId} className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-sm last:border-0">
                    <span className="flex flex-col"><strong>{nom(e.personaId)}</strong><span className="text-xs text-muted">{lugar(e.lugarId).nombre}</span></span>
                    <span className="text-xs tabular-nums text-muted">{e.invitados} invitados · <strong className="text-ink">{e.inscritos}</strong> inscritos</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </Grid>

      <Card title="Directorio" subtitle="Colegios, parroquias, universidades y otros lugares donde se promociona">
        <Directorio inicial={filas} />
      </Card>

      <Grid min={320}>
        <Card title="Enviar flyer a los embajadores" subtitle="Elige la promoción, sube el flyer y escribe el mensaje">
          <EnviarFlyer promociones={PROMOCIONES.map((p) => ({ id: p.id, nombre: p.nombre, embajadores: p.embajadores.map((e) => ({ id: e.personaId, nombre: nom(e.personaId), telefono: persona(e.personaId).telefono ?? "", lugar: lugar(e.lugarId).nombre })) }))} />
        </Card>
        <Card title="Añadir embajador" subtitle="Un embajador invita en su colegio, parroquia o universidad">
          <NuevoEmbajador personas={candidatos} lugares={LUGARES.map((l) => ({ id: l.id, nombre: l.nombre }))} promociones={PROMOCIONES.map((p) => ({ id: p.id, nombre: p.nombre }))} />
        </Card>
      </Grid>

      <Grid min={320}>
        <Card title="Embajadores de parroquia" subtitle="Programas Samuel y Emaús">
          <ul className="flex flex-col">
            {EMBAJADORES_PARROQUIA.map((e) => (
              <li key={`${e.personaId}-${e.programa}`} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
                <span className="flex flex-col"><strong>{nom(e.personaId)}</strong><span className="text-xs text-muted">{lugar(e.lugarId).nombre} · desde {e.desde}</span></span>
                <Badge tone="accent">{e.programa}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Grupos de voluntarios" subtitle="Post retiro y Soñar Despierto, con sus ayudantes">
          <ul className="flex flex-col gap-3">
            {GRUPOS_VOLUNTARIOS.map((g) => (
              <li key={g.id} className="flex flex-col gap-1 rounded-xl bg-surface-2 p-3 text-sm">
                <span className="flex items-center justify-between gap-2"><strong>{g.nombre}</strong><Badge>{g.ayudantes.length + 1} personas</Badge></span>
                <span className="text-xs text-muted">{g.tarea}</span>
                <span className="text-xs"><strong>Coordina:</strong> {nom(g.coordinador)} · <strong>Ayudantes:</strong> {g.ayudantes.map(nom).join(", ")}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>
    </>
  );
}

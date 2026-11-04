"use client";

import { useState } from "react";
import { Badge, Card, Grid, Kpi } from "@/components/ui";
import { Columnas } from "@/components/charts";
import type { Comida } from "@/lib/domain/menu";
import { NOMBRE_RETIRO, type EdicionRetiro, type Invitado, type Pago, type Tarea, type TipoRetiro } from "@/lib/data/retiros";
import { ActaAsociacion, GeneradorFormulario, PagosRetiro, Proveedores, SeguimientoInvitados, SyncFormulario, Tareas } from "./componentes";
import { MenuYCompras } from "./menu";

export interface DatosRetiros {
  ediciones: EdicionRetiro[];
  cambios: { fecha: string; texto: string }[];
  menus: Record<TipoRetiro, Comida[]>;
  tareas: Record<TipoRetiro, Tarea[]>;
  proveedores: { id: string; nombre: string; tipo: string; direccion: string; contacto: string; telefono: string }[];
  invitados: Invitado[];
  equiposInvitados: string[];
  pagos: Pago[];
  gastos: { id: string; descripcion: string; montoUSD: number; tipo: string; fecha: string }[];
  tasa: number;
  campos: Record<TipoRetiro, { campo: string; tipo: string; obligatorio: boolean }[]>;
  formadoresFaltan: Record<string, { nombre: string; cargo: string; telefono: string }[]>;
  cuenta: string;
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("es-VE")}`;
const larga = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" });

export function PanelRetiros({ d }: { d: DatosRetiros }) {
  const [tipo, setTipo] = useState<TipoRetiro>("triduo");
  const deTipo = d.ediciones.filter((e) => e.tipo === tipo).sort((a, b) => a.anio - b.anio);
  const actual = deTipo[deTipo.length - 1];
  const [sel, setSel] = useState<string>(actual.id);
  const e = d.ediciones.find((x) => x.id === sel && x.tipo === tipo) ?? actual;
  const general = sel === "general";
  const enCurso = e.id === actual.id;
  const ganancia = e.ingresosUSD - e.gastosUSD;
  const anterior = deTipo[deTipo.indexOf(e) - 1];
  const titulo = `${NOMBRE_RETIRO[tipo]} ${e.anio}`;
  const faltan = d.formadoresFaltan[e.id] ?? [];
  const aceptan = d.invitados.filter((i) => i.pasos.acepta && i.pasos.inscripcion && !i.no).map((i) => i.nombre);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Retiro" className="flex gap-1 rounded-xl bg-surface-2 p-1 text-sm font-semibold">
          {(["triduo", "ee"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tipo === t} onClick={() => { setTipo(t); setSel(d.ediciones.filter((x) => x.tipo === t).sort((a, b) => b.anio - a.anio)[0].id); }} className={`min-h-10 rounded-lg px-3 ${tipo === t ? "bg-surface shadow-sm" : "text-muted"}`}>{NOMBRE_RETIRO[t]}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">Año
          <select value={general ? "general" : e.id} onChange={(ev) => setSel(ev.target.value)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm">
            <option value="general">Todos los años</option>
            {[...deTipo].reverse().map((x) => <option key={x.id} value={x.id}>{x.anio}{x.id === actual.id ? " (en preparación)" : ""}</option>)}
          </select>
        </label>
      </div>

      {general ? (
        <>
          <Grid min={300}>
            <Card title="Inscritos por año"><Columnas data={deTipo.map((x) => ({ anio: String(x.anio), n: x.inscritos }))} x="anio" y="n" nombre="Inscritos" alto={200} /></Card>
            {tipo === "triduo" ? <Card title="Se asociaron por año" subtitle="Actas de asociación del Triduo"><Columnas data={deTipo.map((x) => ({ anio: String(x.anio), n: x.asociados }))} x="anio" y="n" nombre="Asociados" alto={200} color="var(--gold)" /></Card> : null}
            <Card title="Ganancia por año" subtitle="Ingresos menos gastos"><Columnas data={deTipo.map((x) => ({ anio: String(x.anio), n: x.ingresosUSD - x.gastosUSD }))} x="anio" y="n" nombre="Ganancia" sufijo=" $" alto={200} color="var(--series-2)" /></Card>
          </Grid>
          <Card title={`Todas las ediciones de ${NOMBRE_RETIRO[tipo]}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Año</th><th className="px-2 py-2 font-semibold">Fecha</th><th className="px-2 py-2 text-right font-semibold">Costo</th><th className="px-2 py-2 text-right font-semibold">Inscritos</th>{tipo === "triduo" ? <th className="px-2 py-2 text-right font-semibold">Asociados</th> : null}<th className="px-2 py-2 text-right font-semibold">Ingresos</th><th className="px-2 py-2 text-right font-semibold">Gastos</th><th className="px-2 py-2 text-right font-semibold">Ganancia</th></tr></thead>
                <tbody>{deTipo.map((x) => <tr key={x.id} className="border-t border-border"><td className="px-2 py-2 font-semibold"><button type="button" className="font-semibold underline-offset-2 hover:underline" onClick={() => setSel(x.id)}>{x.anio}</button></td><td className="px-2 py-2">{larga(x.inicio)}</td><td className="px-2 py-2 text-right tabular-nums">{usd(x.costoUSD)}</td><td className="px-2 py-2 text-right tabular-nums">{x.inscritos}</td>{tipo === "triduo" ? <td className="px-2 py-2 text-right tabular-nums">{x.asociados}</td> : null}<td className="px-2 py-2 text-right tabular-nums">{usd(x.ingresosUSD)}</td><td className="px-2 py-2 text-right tabular-nums">{usd(x.gastosUSD)}</td><td className="px-2 py-2 text-right font-bold tabular-nums">{usd(x.ingresosUSD - x.gastosUSD)}</td></tr>)}</tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <>
          <Card title="Formulario conectado" subtitle="Las inscripciones llegan solas desde la hoja de respuestas">
            <SyncFormulario formulario={e.formulario} cambios={enCurso ? d.cambios : []} />
          </Card>
          <Grid min={170}>
            <Kpi label="Fecha" value={new Date(`${e.inicio}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short" })} note={`${e.lugar} · ${e.anio}`} />
            <Kpi label="Costo del retiro" value={usd(e.costoUSD)} note="Por persona" />
            <Kpi label="Inscritos" value={e.inscritos} note={anterior ? `${e.inscritos - anterior.inscritos >= 0 ? "+" : ""}${e.inscritos - anterior.inscritos} vs. ${anterior.anio}` : undefined} />
            {tipo === "triduo" ? <Kpi label="Se asociaron" value={e.asociados} note={`${e.renovaciones} renovaciones`} /> : null}
            <Kpi label="Ha entrado" value={usd(e.ingresosUSD)} note={`Gastos: ${usd(e.gastosUSD)}`} />
            <Kpi label="Ganancia" value={usd(ganancia)} tone={ganancia >= 0 ? "good" : "warn"} note={`10 % a la localidad: ${usd(Math.max(0, ganancia) * 0.1)}`} />
          </Grid>
          {tipo === "triduo" ? (
            <Card title="Seguimiento de invitados" subtitle="Invitación, respuesta, dirección espiritual, si acepta y si se inscribe">
              <SeguimientoInvitados inicial={d.invitados} equipos={d.equiposInvitados} />
            </Card>
          ) : null}
          <Grid min={320}>
            {tipo === "triduo" ? <Card title="Acta de asociación" subtitle={`Para el cierre del Triduo ${e.anio}`}><ActaAsociacion nombres={aceptan} anio={e.anio} fechaRetiro={e.fin} /></Card> : null}
            <Card title="Formadores que faltan por invitar" subtitle={`No han ido a ningún retiro de la sección en ${e.anio}`} action={<Badge tone={faltan.length ? "warn" : "good"}>{faltan.length}</Badge>}>
              <ul className="flex flex-col">
                {faltan.map((f) => (
                  <li key={f.nombre} className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-sm last:border-0">
                    <span className="flex flex-col"><strong>{f.nombre}</strong><span className="text-xs text-muted">{f.cargo}</span></span>
                    <a href={`https://wa.me/${f.telefono.replace(/\D/g, "").replace(/^0/, "58")}?text=${encodeURIComponent(`¡Hola! Te invitamos al ${titulo}. ¿Cuento contigo?`)}`} target="_blank" rel="noreferrer" className="text-xs font-bold">Invitar</a>
                  </li>
                ))}
                {!faltan.length ? <li className="text-sm text-muted">Todos los formadores ya fueron a un retiro este año.</li> : null}
              </ul>
            </Card>
          </Grid>
          <Card title="Economía del retiro" subtitle="Pagos e ingresos en Bs y en dólares, sincronizados con la hoja del Excel">
            <PagosRetiro inicial={enCurso ? d.pagos : []} tasa={d.tasa} costoUSD={e.costoUSD} gastos={enCurso ? d.gastos : []} />
          </Card>
          {enCurso ? (
            <Card title="Formulario de inscripción" subtitle="Se genera desde la cuenta de la sección con los mismos campos que los formularios anteriores">
              <GeneradorFormulario titulo={titulo} campos={d.campos[tipo]} cuenta={d.cuenta} costo={e.costoUSD} fechaTexto={`${larga(e.inicio)} al ${larga(e.fin)}`} lugar={e.lugar} />
            </Card>
          ) : null}
          <Card title="Dónde comprar" subtitle="Directorio de lugares donde se compra cada tipo de alimento"><Proveedores inicial={d.proveedores} /></Card>
          <Card title="Menú, compras y tareas" subtitle="Al final, juntos: el menú se edita y la lista de compras se recalcula sola">
            <MenuYCompras key={tipo} inicial={d.menus[tipo]} titulo={titulo} inscritos={e.inscritos} />
            <Tareas key={`t-${e.id}`} inicial={d.tareas[tipo]} inicio={e.inicio} titulo={titulo} />
          </Card>
        </>
      )}
    </>
  );
}

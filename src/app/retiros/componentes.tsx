"use client";

import { useState } from "react";
import { Check, FileText, Link2, Plus, RefreshCw, Store, UserPlus, X } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { BotonesExportar, descargarDoc } from "@/components/exportar";
import { NOMBRE_PASO, PASOS_INVITACION, type Invitado, type Pago, type PasoInvitacion, type Tarea } from "@/lib/data/retiros";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const fecha = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("es-VE", opts);
const sumarDias = (iso: string, d: number) => { const x = new Date(`${iso}T12:00:00`); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
const usd = (n: number) => `$${n.toLocaleString("es-VE", { maximumFractionDigits: 2 })}`;

export function SyncFormulario({ formulario, cambios }: { formulario: { nombre: string; url: string; ultimaSync: string } | null; cambios: { fecha: string; texto: string }[] }) {
  const [url, setUrl] = useState(formulario?.url === "#" ? "" : formulario?.url ?? "");
  const [sync, setSync] = useState(formulario?.ultimaSync ?? null);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-2">
        {formulario ? (
          <a href={formulario.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold"><Link2 size={16} aria-hidden />{formulario.nombre}</a>
        ) : <p className="text-sm text-muted">Este retiro no tiene formulario conectado.</p>}
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); setSync(new Date().toISOString()); }}>
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">Enlace de la hoja de inscritos (Sheets)
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/…" className={`${campo} text-ink`} />
          </label>
          <span className="self-end"><Button type="submit"><RefreshCw size={16} aria-hidden />Sincronizar inscritos</Button></span>
        </form>
        {sync ? <p className="text-xs text-muted">Última sincronización: {fecha(sync, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}. Se sincroniza sola cada mañana.</p> : null}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Lo que cambió</h3>
        <ul className="flex flex-col gap-1 text-sm">
          {cambios.map((c) => <li key={c.fecha + c.texto} className="flex justify-between gap-2"><span>{c.texto}</span><span className="shrink-0 text-xs text-muted">{fecha(c.fecha)}</span></li>)}
        </ul>
      </div>
    </div>
  );
}

const TONO_PASO: Record<PasoInvitacion, string> = { invitacion: "var(--series-2)", agenda: "var(--series-3)", de: "var(--gold)", acepta: "var(--series-1)", inscripcion: "var(--good-ink)" };

export function SeguimientoInvitados({ inicial, equipos }: { inicial: Invitado[]; equipos: string[] }) {
  const [lista, setLista] = useState(inicial);
  const [nuevo, setNuevo] = useState(false);
  const [filtro, setFiltro] = useState("Todos");
  const visibles = lista.filter((i) => filtro === "Todos" || i.equipo === filtro);
  const cuenta = (k: PasoInvitacion) => lista.filter((i) => i.pasos[k]).length;
  const alternar = (id: string, k: PasoInvitacion) => setLista((l) => l.map((i) => (i.id === id ? { ...i, pasos: { ...i.pasos, [k]: !i.pasos[k] } } : i)));

  return (
    <div className="flex flex-col gap-3">
      <ol className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(130px, 100%), 1fr))" }}>
        <li className="rounded-xl bg-surface-2 p-3"><span className="text-xs font-semibold text-muted">Invitados</span><strong className="block text-2xl tabular-nums">{lista.length}</strong></li>
        {PASOS_INVITACION.map((k) => (
          <li key={k} className="rounded-xl bg-surface-2 p-3" style={{ boxShadow: `inset 4px 0 0 ${TONO_PASO[k]}` }}>
            <span className="text-xs font-semibold text-muted">{NOMBRE_PASO[k]}</span>
            <strong className="block text-2xl tabular-nums">{cuenta(k)} <span className="text-sm font-semibold text-muted">{lista.length ? Math.round((cuenta(k) / lista.length) * 100) : 0}%</span></strong>
          </li>
        ))}
        <li className="rounded-xl bg-surface-2 p-3"><span className="text-xs font-semibold text-muted">Dijeron que no</span><strong className="block text-2xl tabular-nums">{lista.filter((i) => i.no).length}</strong></li>
      </ol>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Equipo<select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={`${campo} text-ink`}><option>Todos</option>{equipos.map((e) => <option key={e}>{e}</option>)}</select></label>
        <span className="ml-auto"><Button onClick={() => setNuevo((v) => !v)}><UserPlus size={16} aria-hidden />Añadir invitado</Button></span>
      </div>
      {nuevo ? (
        <form className="flex flex-wrap items-end gap-2 rounded-xl bg-surface-2 p-3" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setLista((l) => [{ id: `n${l.length}`, personaId: "", nombre: String(f.get("nombre")), equipo: String(f.get("equipo")), pasos: { invitacion: false, agenda: false, de: false, acepta: false, inscripcion: false }, no: false }, ...l]); setNuevo(false); }}>
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">Nombre<input name="nombre" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Equipo<select name="equipo" className={campo}>{equipos.map((e) => <option key={e}>{e}</option>)}<option>Sin equipo</option></select></label>
          <Button type="submit">Añadir</Button>
        </form>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Joven</th><th className="px-2 py-2 font-semibold">Equipo</th>{PASOS_INVITACION.map((k) => <th key={k} className="px-1 py-2 text-center text-xs font-semibold">{NOMBRE_PASO[k]}</th>)}<th className="px-1 py-2 text-center text-xs font-semibold">No</th></tr></thead>
          <tbody>
            {visibles.map((i) => {
              const ultimo = [...PASOS_INVITACION].reverse().find((k) => i.pasos[k]);
              return (
                <tr key={i.id} className="border-t border-border" style={ultimo && !i.no ? { boxShadow: `inset 4px 0 0 ${TONO_PASO[ultimo]}` } : undefined}>
                  <td className="px-2 py-1.5 font-semibold">{i.nombre}</td>
                  <td className="px-2 py-1.5 text-muted">{i.equipo}</td>
                  {PASOS_INVITACION.map((k) => (
                    <td key={k} className="px-1 py-1.5 text-center">
                      <button type="button" aria-pressed={i.pasos[k]} aria-label={`${NOMBRE_PASO[k]}: ${i.nombre}`} onClick={() => alternar(i.id, k)} className="inline-flex size-8 items-center justify-center rounded-lg border border-border" style={i.pasos[k] ? { background: TONO_PASO[k], borderColor: TONO_PASO[k], color: "white" } : undefined}>
                        {i.pasos[k] ? <Check size={14} aria-hidden /> : null}
                      </button>
                    </td>
                  ))}
                  <td className="px-1 py-1.5 text-center">
                    <button type="button" aria-pressed={i.no} aria-label={`Dijo que no: ${i.nombre}`} onClick={() => setLista((l) => l.map((x) => (x.id === i.id ? { ...x, no: !x.no } : x)))} className={`inline-flex size-8 items-center justify-center rounded-lg border ${i.no ? "border-warn-border bg-warn-bg text-warn-ink" : "border-border"}`}>{i.no ? <X size={14} aria-hidden /> : null}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">Misma tabla que la hoja “Asociaciones” del Excel del Triduo: el color de la fila marca el último paso logrado.</p>
    </div>
  );
}

/** Acta de asociación: misma estructura del documento modelo, con los nombres de quienes se asocian. */
export function ActaAsociacion({ nombres, anio, fechaRetiro }: { nombres: string[]; anio: number; fechaRetiro: string }) {
  const [lista, setLista] = useState(nombres);
  const [nuevo, setNuevo] = useState("");
  const texto = () => [
    `Acta de asociación al Regnum Christi · Triduo ${anio}`,
    `En Barquisimeto, el ${fecha(fechaRetiro, { day: "numeric", month: "long", year: "numeric" })}, al concluir el Triduo de renovación de la sección de jóvenes, las personas que se nombran a continuación manifiestan libremente su deseo de asociarse al Regnum Christi:`,
    ...lista.map((n, i) => `- ${i + 1}. ${n} ................................ Firma`),
    "",
    "Director de sección ................................ Firma",
    "Director local ................................ Firma",
  ].join("\n");
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-2">Se llena con quienes aceptaron asociarse y se inscribieron. Cuando subas el documento modelo, el acta toma su mismo formato y solo cambia los nombres.</p>
      <ol className="flex flex-col gap-1 text-sm">
        {lista.map((n, i) => (
          <li key={n + i} className="flex items-center justify-between gap-2 border-b border-border py-1 last:border-0">
            <span><span className="text-muted tabular-nums">{i + 1}.</span> {n}</span>
            <button type="button" aria-label={`Quitar a ${n}`} onClick={() => setLista((l) => l.filter((_, j) => j !== i))} className="p-1 text-muted hover:text-ink"><X size={14} /></button>
          </li>
        ))}
      </ol>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (nuevo.trim()) setLista((l) => [...l, nuevo.trim()]); setNuevo(""); }}>
        <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Añadir nombre" aria-label="Añadir nombre" className={`${campo} flex-1`} />
        <Button type="submit" variant="secondary"><Plus size={16} aria-hidden />Añadir</Button>
      </form>
      <span className="flex flex-wrap gap-2">
        <Button onClick={() => descargarDoc(`Acta de asociación Triduo ${anio}`, texto())}><FileText size={16} aria-hidden />Generar acta ({lista.length})</Button>
      </span>
    </div>
  );
}

export function PagosRetiro({ inicial, tasa, costoUSD, gastos }: { inicial: Pago[]; tasa: number; costoUSD: number; gastos: { id: string; descripcion: string; montoUSD: number; tipo: string; fecha: string }[] }) {
  const [pagos, setPagos] = useState(inicial);
  const [t, setT] = useState(tasa);
  const [editando, setEditando] = useState<string | null>(null);
  const total = (p: Pago) => p.montoUSD + p.montoBs / t;
  const ingresos = pagos.reduce((a, p) => a + total(p), 0);
  const egresos = gastos.reduce((a, g) => a + g.montoUSD, 0);
  const guardar = (e: React.FormEvent<HTMLFormElement>, id: string | null) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const p: Pago = { id: id ?? `n${pagos.length}`, nombre: String(f.get("nombre")), metodo: f.get("metodo") as Pago["metodo"], montoBs: Number(f.get("bs")) || 0, montoUSD: Number(f.get("usd")) || 0, fecha: String(f.get("fecha")) };
    setPagos((l) => (id ? l.map((x) => (x.id === id ? p : x)) : [p, ...l]));
    setEditando(null);
  };
  const formulario = (p: Pago | null) => (
    <form onSubmit={(e) => guardar(e, p?.id ?? null)} className="grid gap-2 rounded-xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 100%), 1fr))" }}>
      <label className="flex flex-col gap-1 text-xs font-semibold">Nombre<input name="nombre" required defaultValue={p?.nombre} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Método<select name="metodo" defaultValue={p?.metodo ?? "Pago móvil"} className={campo}>{["Pago móvil", "Zelle", "Efectivo $", "Transferencia"].map((m) => <option key={m}>{m}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Monto Bs<input name="bs" type="number" min={0} step="0.01" defaultValue={p?.montoBs || ""} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Monto $<input name="usd" type="number" min={0} step="0.01" defaultValue={p?.montoUSD || ""} className={campo} /></label>
      <label className="flex flex-col gap-1 text-xs font-semibold">Fecha<input name="fecha" type="date" required defaultValue={p?.fecha ?? "2026-11-01"} className={campo} /></label>
      <span className="col-span-full flex gap-2"><Button type="submit">Guardar en el Excel</Button><Button type="button" variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button></span>
    </form>
  );
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))" }}>
        {[["Ha entrado", usd(ingresos), `${pagos.length} pagos`], ["Gastos registrados", usd(egresos), `${gastos.length} gastos`], ["Balance", usd(ingresos - egresos), "Hoja Economía"], ["Pagos completos", `${pagos.filter((p) => total(p) >= costoUSD - 0.5).length} de ${pagos.length}`, `Costo: ${usd(costoUSD)}`]].map(([l, v, n]) => (
          <div key={l} className="rounded-xl bg-surface-2 p-3"><dt className="text-xs font-semibold text-muted">{l}</dt><dd className="text-xl font-extrabold tabular-nums">{v}</dd><dd className="text-xs text-muted">{n}</dd></div>
        ))}
      </dl>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Tasa BCV (Bs por $)<input type="number" min={1} step="0.01" value={t} onChange={(e) => setT(Number(e.target.value) || 1)} className={`${campo} w-32 text-ink`} /></label>
        <span className="ml-auto"><Button onClick={() => setEditando("nuevo")}><Plus size={16} aria-hidden />Registrar pago</Button></span>
      </div>
      {editando === "nuevo" ? formulario(null) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr className="text-left text-muted"><th className="px-2 py-2 font-semibold">Nombre</th><th className="px-2 py-2 font-semibold">Método</th><th className="px-2 py-2 text-right font-semibold">Bs</th><th className="px-2 py-2 text-right font-semibold">$</th><th className="px-2 py-2 text-right font-semibold">Total en $</th><th className="px-2 py-2 font-semibold">Fecha</th><th className="px-2 py-2 font-semibold">Estado</th><th /></tr></thead>
          <tbody>
            {pagos.map((p) => (
              editando === p.id ? <tr key={p.id}><td colSpan={8} className="py-2">{formulario(p)}</td></tr> : (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-2 py-1.5 font-semibold">{p.nombre}</td>
                  <td className="px-2 py-1.5">{p.metodo}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{p.montoBs ? p.montoBs.toLocaleString("es-VE") : "—"}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{p.montoUSD || "—"}</td>
                  <td className="px-2 py-1.5 text-right font-bold tabular-nums">{usd(total(p))}</td>
                  <td className="px-2 py-1.5">{fecha(p.fecha)}</td>
                  <td className="px-2 py-1.5">{total(p) >= costoUSD - 0.5 ? <Badge tone="good">Completo</Badge> : <Badge tone="warn">Falta {usd(costoUSD - total(p))}</Badge>}</td>
                  <td className="px-2 py-1.5"><button type="button" className="text-xs font-semibold" onClick={() => setEditando(p.id)}>Editar</button></td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">Cada cambio se escribe en la hoja “Pagos” del Excel del retiro. El total en dólares usa la tasa BCV de arriba.</p>
    </div>
  );
}

export function Tareas({ inicial, inicio, titulo }: { inicial: Tarea[]; inicio: string; titulo: string }) {
  const [tareas, setTareas] = useState(inicial);
  const ordenadas = [...tareas].sort((a, b) => a.dia - b.dia);
  const hechas = tareas.filter((t) => t.hecha).length;
  const texto = () => [`Tareas ${titulo}`, ...ordenadas.map((t) => `- [${t.hecha ? "x" : " "}] ${fecha(sumarDias(inicio, t.dia))} · ${t.tarea} (${t.responsable})`)].join("\n");
  return (
    <details className="group rounded-xl border border-border" open>
      <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 text-sm font-semibold">
        <span>Tareas del retiro · {hechas} de {tareas.length} completadas</span>
        <span className="h-2 w-32 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full" style={{ width: `${(hechas / Math.max(1, tareas.length)) * 100}%`, background: "var(--series-1)" }} /></span>
      </summary>
      <div className="flex flex-col gap-3 border-t border-border p-3">
        <ul className="flex flex-col gap-1 text-sm">
          {ordenadas.map((t) => (
            <li key={t.id} className="flex items-center gap-3 border-b border-border py-1.5 last:border-0">
              <input type="checkbox" checked={t.hecha} onChange={() => setTareas((l) => l.map((x) => (x.id === t.id ? { ...x, hecha: !x.hecha } : x)))} aria-label={t.tarea} className="size-5 accent-brand" />
              <span className={`flex-1 ${t.hecha ? "text-muted line-through" : ""}`}>{t.tarea}</span>
              <Badge tone={t.dia < 0 ? "neutral" : "accent"}>{t.dia < 0 ? `${-t.dia} días antes` : `${t.dia} días después`}</Badge>
              <span className="w-16 text-xs text-muted">{fecha(sumarDias(inicio, t.dia))}</span>
              <span className="hidden w-32 text-xs text-muted sm:block">{t.responsable}</span>
            </li>
          ))}
        </ul>
        <form className="flex flex-wrap items-end gap-2 rounded-xl bg-surface-2 p-3" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setTareas((l) => [...l, { id: `n${l.length}`, tarea: String(f.get("tarea")), dia: -Math.abs(Number(f.get("dias")) || 0), responsable: String(f.get("resp")) || "Sin asignar", hecha: false }]); e.currentTarget.reset(); }}>
          <label className="flex flex-1 flex-col gap-1 text-xs font-semibold">Nuevo paso<input name="tarea" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Días antes del retiro<input name="dias" type="number" min={0} defaultValue={7} className={`${campo} w-28`} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Responsable<input name="resp" className={`${campo} w-40`} /></label>
          <Button type="submit"><Plus size={16} aria-hidden />Añadir paso</Button>
        </form>
        <BotonesExportar nombre={`Tareas ${titulo}`} texto={texto} />
      </div>
    </details>
  );
}

type Proveedor = { id: string; nombre: string; tipo: string; direccion: string; contacto: string; telefono: string };
export function Proveedores({ inicial }: { inicial: Proveedor[] }) {
  const [lista, setLista] = useState(inicial);
  const [nuevo, setNuevo] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))" }}>
        {lista.map((p) => (
          <li key={p.id} className="flex flex-col gap-1 rounded-xl bg-surface-2 p-3 text-sm">
            <span className="flex items-center justify-between gap-2"><strong>{p.nombre}</strong><Badge>{p.tipo}</Badge></span>
            <span className="text-xs text-muted">{p.direccion}</span>
            <span className="text-xs">{p.contacto} · <a href={`tel:${p.telefono.replace(/\D/g, "")}`}>{p.telefono}</a></span>
          </li>
        ))}
      </ul>
      {nuevo ? (
        <form className="grid gap-2 rounded-xl bg-surface-2 p-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }} onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); setLista((l) => [...l, { id: `n${l.length}`, nombre: String(f.get("nombre")), tipo: String(f.get("tipo")), direccion: String(f.get("direccion")), contacto: String(f.get("contacto")), telefono: String(f.get("telefono")) }]); setNuevo(false); }}>
          <label className="flex flex-col gap-1 text-xs font-semibold">Lugar<input name="nombre" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Qué se compra<input name="tipo" required className={campo} placeholder="Proteínas, verduras…" /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Dirección<input name="direccion" className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Contacto<input name="contacto" className={campo} /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold">Teléfono<input name="telefono" type="tel" className={campo} /></label>
          <span className="col-span-full flex gap-2"><Button type="submit">Guardar</Button><Button type="button" variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button></span>
        </form>
      ) : <Button variant="secondary" onClick={() => setNuevo(true)}><Store size={16} aria-hidden />Añadir lugar de compra</Button>}
    </div>
  );
}

/** Genera el formulario de Google de un retiro desde la cuenta de la sección, con los mismos campos que los anteriores. */
export function GeneradorFormulario({ titulo, campos, cuenta, costo, fechaTexto, lugar }: { titulo: string; campos: { campo: string; tipo: string; obligatorio: boolean }[]; cuenta: string; costo: number; fechaTexto: string; lugar: string }) {
  const [creado, setCreado] = useState(false);
  const [extra, setExtra] = useState("Trae ropa cómoda, artículos de aseo, sábanas y tu Biblia.");
  const descripcion = `¡Te invitamos a vivir el ${titulo}! 🙏\n\n📅 ${fechaTexto}\n📍 ${lugar}\n💵 Aporte: $${costo} (puedes pagar en abonos por pago móvil, Zelle o efectivo).\n\n${extra}\n\nCualquier duda escríbele a quien te invitó. ¡Venga tu Reino!`;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Información para la descripción<textarea value={extra} onChange={(e) => setExtra(e.target.value)} className={`${campo} min-h-20 py-2 text-ink`} /></label>
        <div className="rounded-xl bg-surface-2 p-3 text-sm"><strong className="block">{titulo}</strong><p className="mt-1 whitespace-pre-line text-ink-2">{descripcion}</p></div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">{campos.length} preguntas</h3>
        <ol className="flex flex-col gap-1 text-sm">
          {campos.map((c, i) => <li key={c.campo} className="flex justify-between gap-2"><span><span className="text-muted tabular-nums">{i + 1}.</span> {c.campo}{c.obligatorio ? <span className="text-brand"> *</span> : null}</span><span className="shrink-0 text-xs text-muted">{c.tipo}</span></li>)}
        </ol>
        <Button onClick={() => setCreado(true)}><FileText size={16} aria-hidden />Crear formulario en {cuenta}</Button>
        {creado ? <p role="status" className="rounded-xl bg-good-bg p-3 text-sm text-good-ink">Formulario creado (simulado). Sus respuestas van a una hoja nueva que queda conectada a este retiro.</p> : null}
      </div>
    </div>
  );
}

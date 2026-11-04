"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui";

export interface FilaPersona {
  id: string; nombre: string; cedula: string | null; telefono: string | null; correo: string | null; zona: string | null;
  profesion: string | null; sexo: "M" | "F"; edad: number | null; estado: "hace_vida" | "de_paso"; formador: string | null;
  actividades: number; servicios: number; equipo: string | null; ultimaDE: string | null;
  asistio: string[]; sirvio: string[]; faltan: string[];
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const RANGOS = [["todas", "Todas"], ["16-18", "16 a 18"], ["19-22", "19 a 22"], ["23-26", "23 a 26"], ["27-99", "27 o más"]] as const;
const sel = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

export function TablaPersonas({ filas, actividades, profesiones }: { filas: FilaPersona[]; actividades: { id: string; nombre: string }[]; profesiones: string[] }) {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | "hace_vida" | "de_paso" | "formadores" | "faltantes">("todos");
  const [sexo, setSexo] = useState<"todos" | "M" | "F">("todos");
  const [rango, setRango] = useState<(typeof RANGOS)[number][0]>("todas");
  const [prof, setProf] = useState("todas");
  const [retiro, setRetiro] = useState("todos");
  const [rol, setRol] = useState<"cualquiera" | "asistio" | "sirvio">("cualquiera");
  const [verTodo, setVerTodo] = useState(false);

  const vis = useMemo(() => {
    const n = norm(q);
    const [emin, emax] = rango === "todas" ? [0, 200] : rango.split("-").map(Number);
    return filas.filter((f) =>
      (estado === "todos" || (estado === "formadores" ? f.formador : estado === "faltantes" ? f.faltan.length > 0 : f.estado === estado)) &&
      (sexo === "todos" || f.sexo === sexo) &&
      (rango === "todas" || (f.edad !== null && f.edad >= emin && f.edad <= emax)) &&
      (prof === "todas" || f.profesion === prof) &&
      (retiro === "todos" || (rol === "asistio" ? f.asistio.includes(retiro) : rol === "sirvio" ? f.sirvio.includes(retiro) : f.asistio.includes(retiro) || f.sirvio.includes(retiro))) &&
      (!n || norm(f.nombre).includes(n) || (f.cedula ?? "").includes(n) || norm(f.telefono ?? "").includes(n)));
  }, [filas, q, estado, sexo, rango, prof, retiro, rol]);

  const limite = verTodo ? vis.length : 15;
  const limpiar = () => { setQ(""); setEstado("todos"); setSexo("todos"); setRango("todas"); setProf("todas"); setRetiro("todos"); setRol("cualquiera"); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <label className="flex min-h-11 min-w-56 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3">
          <span className="sr-only">Buscar</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, cédula o teléfono" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1">
          {([["todos", "Todos"], ["hace_vida", "Hacen vida"], ["de_paso", "Han pasado"], ["formadores", "Formadores"], ["faltantes", "Datos faltantes"]] as const).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={estado === v} onClick={() => setEstado(v)} className={`min-h-9 rounded-lg px-3 text-sm font-semibold ${estado === v ? "bg-surface text-ink shadow-sm" : "text-muted"}`}>{l}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Género
          <select className={sel} value={sexo} onChange={(e) => setSexo(e.target.value as typeof sexo)}><option value="todos">Todos</option><option value="M">Hombres</option><option value="F">Mujeres</option></select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Edad
          <select className={sel} value={rango} onChange={(e) => setRango(e.target.value as typeof rango)}>{RANGOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Profesión
          <select className={sel} value={prof} onChange={(e) => setProf(e.target.value)}><option value="todas">Todas</option>{profesiones.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Retiro o actividad
          <select className={sel} value={retiro} onChange={(e) => setRetiro(e.target.value)}><option value="todos">Todos</option>{actividades.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Cómo participó
          <select className={sel} value={rol} onChange={(e) => setRol(e.target.value as typeof rol)} disabled={retiro === "todos"}><option value="cualquiera">Asistió o sirvió</option><option value="asistio">Asistió (caminante)</option><option value="sirvio">Sirvió</option></select>
        </label>
        <button type="button" onClick={limpiar} className="min-h-11 rounded-xl px-3 text-sm font-semibold text-accent">Limpiar filtros</button>
      </div>
      <p className="text-xs text-muted">{vis.length} personas{verTodo ? "" : vis.length > limite ? ` · mostrando ${limite}` : ""}</p>
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${verTodo ? "min-w-[1180px]" : "min-w-[760px]"}`}>
          <thead>
            <tr className="text-left text-muted">
              <th className="px-2 py-2 font-semibold">Nombre</th>
              {verTodo ? <><th className="px-2 py-2 font-semibold">Cédula</th><th className="px-2 py-2 font-semibold">Teléfono</th><th className="px-2 py-2 font-semibold">Correo</th><th className="px-2 py-2 font-semibold">Zona</th><th className="px-2 py-2 font-semibold">Profesión</th></> : null}
              <th className="px-2 py-2 text-right font-semibold">Edad</th><th className="px-2 py-2 font-semibold">Estado</th>
              <th className="px-2 py-2 font-semibold">Equipo</th><th className="px-2 py-2 text-right font-semibold">Actividades</th><th className="px-2 py-2 text-right font-semibold">Veces que sirvió</th><th className="px-2 py-2 font-semibold">Última DE</th>
            </tr>
          </thead>
          <tbody>
            {vis.slice(0, limite).map((f) => (
              <tr key={f.id} className="border-t border-border">
                <td className="px-2 py-2.5">
                  <Link href={`/personas/${f.id}`} className="font-semibold">{f.nombre}</Link>
                  {f.formador ? <span className="block text-xs text-muted">{f.formador}</span> : null}
                </td>
                {verTodo ? (
                  <>
                    <td className="px-2 py-2.5 tabular-nums">{f.cedula ?? <span className="text-warn-ink">Falta</span>}</td>
                    <td className="px-2 py-2.5 tabular-nums">{f.telefono ?? "—"}</td>
                    <td className="max-w-48 truncate px-2 py-2.5">{f.correo ?? "—"}</td>
                    <td className="px-2 py-2.5">{f.zona ?? "—"}</td>
                    <td className="px-2 py-2.5">{f.profesion ?? "—"}</td>
                  </>
                ) : null}
                <td className="px-2 py-2.5 text-right tabular-nums">{f.edad ?? "—"}</td>
                <td className="px-2 py-2.5"><Badge tone={f.estado === "hace_vida" ? "good" : "neutral"}>{f.estado === "hace_vida" ? "Hace vida" : "Han pasado"}</Badge></td>
                <td className="px-2 py-2.5">{f.equipo ?? "—"}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{f.actividades}</td>
                <td className="px-2 py-2.5 text-right tabular-nums">{f.servicios}</td>
                <td className="px-2 py-2.5">{f.ultimaDE ? new Date(f.ultimaDE).toLocaleDateString("es-VE") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => setVerTodo((v) => !v)} aria-expanded={verTodo}
        className="inline-flex min-h-11 items-center justify-center gap-2 self-center rounded-xl border border-border px-5 text-sm font-bold hover:border-brand">
        {verTodo ? <><ChevronUp size={16} aria-hidden />Ver menos</> : <><ChevronDown size={16} aria-hidden />Ver todo ({vis.length} personas con todos sus datos)</>}
      </button>
    </div>
  );
}

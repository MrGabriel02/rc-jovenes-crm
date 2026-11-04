"use client";

import { useState } from "react";
import { ExternalLink, Images, Plus, Share2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { Album } from "@/lib/data/avisos";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

export function Albumes({ inicial, apostolados, cuenta }: { inicial: Album[]; apostolados: string[]; cuenta: string }) {
  const [lista, setLista] = useState(inicial);
  const [filtro, setFiltro] = useState("Todos");
  const [anio, setAnio] = useState("Todos");
  const [nuevo, setNuevo] = useState(false);
  const anios = [...new Set(lista.map((a) => a.fecha.slice(0, 4)))].sort().reverse();
  const visibles = lista.filter((a) => (filtro === "Todos" || a.apostolado === filtro) && (anio === "Todos" || a.fecha.startsWith(anio))).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const compartidos = lista.filter((a) => a.compartidoCon);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Apostolado
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={`${campo} text-ink`}><option>Todos</option><option>General</option>{apostolados.map((a) => <option key={a}>{a}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Año
          <select value={anio} onChange={(e) => setAnio(e.target.value)} className={`${campo} text-ink`}><option>Todos</option>{anios.map((a) => <option key={a}>{a}</option>)}</select>
        </label>
        <span className="ml-auto"><Button onClick={() => setNuevo((v) => !v)}><Plus size={16} aria-hidden />Añadir álbum</Button></span>
      </div>
      {nuevo ? (
        <form
          className="grid gap-3 rounded-xl bg-surface-2 p-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const url = String(f.get("url"));
            setLista((l) => [{ id: `n${l.length}`, titulo: String(f.get("titulo")), apostolado: String(f.get("apostolado")), actividad: String(f.get("actividad")), fecha: String(f.get("fecha")), servicio: url.includes("photos") ? "Google Fotos" : "Google Drive", fotos: 0, compartidoCon: f.get("compartir") === "on", url }, ...l]);
            setNuevo(false);
          }}
        >
          <label className="col-span-full flex flex-col gap-1 text-sm font-semibold">Enlace de Drive o Google Fotos<input name="url" type="url" required placeholder="https://photos.app.goo.gl/…" className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Título<input name="titulo" required className={campo} /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Apostolado<select name="apostolado" className={campo}><option>General</option>{apostolados.map((a) => <option key={a}>{a}</option>)}</select></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Actividad<input name="actividad" required className={campo} placeholder="Retiro, misión, encuentro…" /></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Fecha<input name="fecha" type="date" required className={campo} /></label>
          <label className="col-span-full inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="compartir" defaultChecked className="size-4" />Compartir con {cuenta}</label>
          <div className="col-span-full flex gap-2"><Button type="submit">Guardar álbum</Button><Button type="button" variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button></div>
        </form>
      ) : null}
      <ul className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))" }}>
        {visibles.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
            <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--nav-2),var(--brand))] text-white/90"><Images size={32} aria-hidden /></div>
            <strong className="text-sm">{a.titulo}</strong>
            <span className="text-xs text-muted">{a.actividad} · {new Date(`${a.fecha}T12:00:00`).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}{a.fotos ? ` · ${a.fotos} fotos` : ""}</span>
            <span className="flex flex-wrap gap-1"><Badge tone={a.apostolado === "General" ? "neutral" : "accent"}>{a.apostolado}</Badge><Badge>{a.servicio}</Badge>{a.compartidoCon ? <Badge tone="good">Compartido</Badge> : null}</span>
            <a href={a.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold no-underline hover:border-brand"><ExternalLink size={16} aria-hidden />Abrir álbum</a>
          </li>
        ))}
        {!visibles.length ? <li className="text-sm text-muted">No hay álbumes con ese filtro.</li> : null}
      </ul>
      <section className="flex flex-col gap-2 rounded-2xl bg-surface-2 p-4">
        <h3 className="flex items-center gap-2 text-sm font-extrabold"><Share2 size={16} aria-hidden />Compartidos con {cuenta}</h3>
        <p className="text-xs text-muted">Cuando un apostolado comparte su álbum con esta cuenta aparece aquí solo, sin copiar las fotos: se quedan en el Drive o Google Fotos de quien las subió.</p>
        <ul className="flex flex-col">
          {compartidos.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
              <span className="flex flex-col"><strong>{a.titulo}</strong><span className="text-xs text-muted">{a.apostolado} · {a.servicio}</span></span>
              <a href={a.url} target="_blank" rel="noreferrer" className="text-xs font-semibold">Abrir</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

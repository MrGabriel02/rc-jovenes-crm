"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Expand, HardDrive, MapPin, WifiOff } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { Camara } from "@/lib/data/camaras";

const ESTADO: Record<Camara["estado"], { label: string; tone: "good" | "warn" | "accent" }> = {
  en_linea: { label: "En línea", tone: "good" },
  grabando_sd: { label: "Solo grabando en SD", tone: "accent" },
  sin_conexion: { label: "Sin conexión", tone: "warn" },
};

function Reloj({ base }: { base: string }) {
  // Reloj de la vista simulada: arranca en la hora de la demo y avanza en vivo.
  const [seg, setSeg] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeg((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const d = new Date(new Date(base).getTime() + seg * 1000);
  return <span className="tabular-nums" suppressHydrationWarning>{d.toLocaleDateString("es-VE")} {d.toLocaleTimeString("es-VE")}</span>;
}

function Vista({ c, grande, ahora }: { c: Camara; grande?: boolean; ahora: string }) {
  const caida = c.estado === "sin_conexion";
  return (
    <div className={clsx("relative overflow-hidden rounded-xl bg-[#120a0b] text-white", grande ? "aspect-video" : "aspect-video")}>
      {caida ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-white/70">
          <WifiOff size={grande ? 40 : 22} aria-hidden />
          <span className={grande ? "text-sm" : "text-xs"}>Sin señal</span>
        </div>
      ) : (
        <div aria-hidden className="h-full w-full bg-[radial-gradient(ellipse_at_30%_40%,#3b2a2c_0%,#1a1012_60%,#0d0708_100%)]">
          <div className="absolute inset-x-[12%] bottom-[18%] h-[30%] rounded-md border border-white/10 bg-white/5" />
          <div className="absolute left-[60%] top-[22%] h-[40%] w-[14%] rounded-sm border border-white/10 bg-white/5" />
        </div>
      )}
      {!grande ? (
        !caida ? <span aria-hidden className="absolute right-2 top-2 size-2 animate-pulse rounded-full bg-red-500" /> : null
      ) : (<>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-3 py-2 text-xs">
        <span className="font-bold">{c.nombre}</span>
        {!caida ? <span className="flex items-center gap-1.5 font-bold"><span className="size-2 animate-pulse rounded-full bg-red-500" />EN VIVO</span> : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-[11px] text-white/85">
        <Reloj base={ahora} />
        <span>Vista simulada</span>
      </div>
      </>)}
    </div>
  );
}

export function PanelCamaras({ camaras, ahora }: { camaras: Camara[]; ahora: string }) {
  const [sel, setSel] = useState(camaras[0].id);
  const c = camaras.find((x) => x.id === sel)!;
  const pct = c.sdTotalGB ? Math.round((c.sdUsadaGB / c.sdTotalGB) * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-label="Vista en vivo" className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <Vista c={c} grande ahora={ahora} />
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
          {camaras.map((x) => (
            <button key={x.id} id={x.id} type="button" onClick={() => setSel(x.id)} aria-pressed={x.id === sel}
              className={clsx("flex flex-col gap-1.5 rounded-xl p-1.5 text-left transition-colors", x.id === sel ? "bg-accent-soft ring-2 ring-brand" : "hover:bg-surface-2")}>
              <Vista c={x} ahora={ahora} />
              <span className="px-1 text-xs font-semibold">{x.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-extrabold">{c.nombre}</h2>
          <Badge tone={ESTADO[c.estado].tone}>{ESTADO[c.estado].label}</Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-ink-2"><MapPin size={16} aria-hidden />{c.ubicacion}</p>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 font-semibold"><HardDrive size={16} aria-hidden />Tarjeta microSD</span><span className="tabular-nums">{c.sdUsadaGB} de {c.sdTotalGB} GB</span></span>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Uso de la tarjeta">
            <div className={clsx("h-full rounded-full", pct >= 90 ? "bg-[var(--warn-ink)]" : "bg-brand")} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted">{c.diasGrabados} días grabados. Al llenarse, la cámara sobrescribe lo más antiguo.</span>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="secondary"><Expand size={16} aria-hidden />Pantalla completa</Button>
          <Button variant="secondary">Ver grabaciones de la SD</Button>
          <a href="/casa" className="text-center text-sm font-semibold">Ver en el mapa de la casa</a>
        </div>
        <p className="rounded-lg bg-surface-2 p-3 text-xs text-ink-2">Cada vez que alguien abre una cámara queda registrado quién la vio y cuándo.</p>
      </aside>
    </div>
  );
}

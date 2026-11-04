"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Copy, Link2, Smartphone } from "lucide-react";
import { Button, Card, LinkButton } from "@/components/ui";

const BASE = "https://rc-jovenes-crm.vercel.app";
const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

/** Genera el enlace (y su QR) para que una persona se inscriba en la base o en una actividad. */
export function EnlaceInscripcion({ destinos }: { destinos: { id: string; nombre: string }[] }) {
  const [destino, setDestino] = useState("base");
  const [vence, setVence] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const generar = async () => {
    const q = new URLSearchParams({ origen: destino, ...(vence ? { hasta: vence } : {}) });
    const u = `${BASE}/inscripcion?${q}`;
    setUrl(u);
    setQr(await QRCode.toDataURL(u, { margin: 1, width: 200, color: { dark: "#5b0d14" } }));
  };

  return (
    <Card title="Enlace de inscripción" subtitle="La persona llena sus datos y entra sola a la base (y a la actividad, si eliges una)">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">Para qué
          <select value={destino} onChange={(e) => { setDestino(e.target.value); setUrl(null); }} className={`${campo} text-ink`}>
            <option value="base">Base general de la sección</option>
            <option value="equipo">Quiero entrar a un equipo de encuentro</option>
            {destinos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Vence (opcional)<input type="date" value={vence} onChange={(e) => setVence(e.target.value)} className={`${campo} text-ink`} /></label>
        <Button onClick={generar}><Link2 size={16} aria-hidden />Generar enlace</Button>
      </div>
      {url ? (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface-2 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- QR generado en el navegador */}
          {qr ? <img src={qr} alt="Código QR del enlace de inscripción" width={140} height={140} className="rounded-lg bg-white p-1" /> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <code className="break-all rounded-lg bg-surface px-2 py-1 text-xs">{url}</code>
            <span className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopiado(true); } catch { /* sin permiso */ } }}><Copy size={16} aria-hidden />{copiado ? "Copiado" : "Copiar enlace"}</Button>
              <LinkButton href={`/inscripcion?origen=${destino}`} variant="secondary">Ver el formulario</LinkButton>
            </span>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border p-3 text-sm">
        <span className="flex items-center gap-2"><Smartphone size={18} aria-hidden className="text-accent" />App de formadores: inicio limpio con su apostolado, calendario, retiros y recordatorios.</span>
        <LinkButton href="/formador">Ver como formador</LinkButton>
      </div>
    </Card>
  );
}

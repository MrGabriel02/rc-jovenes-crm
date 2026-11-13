"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

interface Propuesta { persona: string; rol: string; motivo: string; estado: "enviada" | "aprobada" }
const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";

/** El director del apostolado propone un integrante nuevo; la propuesta llega al director de sección para aprobarla. */
export function ProponerIntegrante({ apostolado, personas, roles }: { apostolado: string; personas: string[]; roles: string[] }) {
  const [lista, setLista] = useState<Propuesta[]>([]);
  return (
    <Card id="proponer" title="Proponer integrante" subtitle={`La propuesta llega al director de sección. Cuando la aprueba, la persona entra a ${apostolado}.`}>
      <form className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }} onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setLista((l) => [{ persona: String(f.get("persona")), rol: String(f.get("rol")), motivo: String(f.get("motivo")), estado: "enviada" }, ...l]);
        e.currentTarget.reset();
      }}>
        <label className="flex flex-col gap-1 text-sm font-semibold">Joven<input name="persona" list="prop-personas" required className={campo} /><datalist id="prop-personas">{personas.map((p) => <option key={p} value={p} />)}</datalist></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Rol<select name="rol" className={campo}>{roles.map((r) => <option key={r}>{r}</option>)}</select></label>
        <label className="col-span-full flex flex-col gap-1 text-sm font-semibold">Por qué lo propones<textarea name="motivo" required rows={2} className={`${campo} py-2`} placeholder="Sirvió en los dos últimos retiros y tiene DE" /></label>
        <div className="col-span-full"><Button type="submit"><Send size={16} aria-hidden />Enviar al director de sección</Button></div>
      </form>
      {lista.length ? (
        <ul className="flex flex-col gap-2">
          {lista.map((p, i) => (
            <li key={p.persona + i} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 p-3 text-sm">
              <span className="flex min-w-0 flex-1 flex-col"><strong>{p.persona} · {p.rol}</strong><span className="text-xs text-muted">{p.motivo}</span></span>
              {p.estado === "aprobada" ? <Badge tone="good">Aprobada</Badge> : (
                <>
                  <Badge tone="accent">Esperando al director de sección</Badge>
                  <button type="button" onClick={() => setLista((l) => l.map((x, j) => (j === i ? { ...x, estado: "aprobada" } : x)))} className="min-h-9 rounded-lg border border-border px-2.5 text-xs font-semibold hover:border-brand">Aprobar (vista del director)</button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

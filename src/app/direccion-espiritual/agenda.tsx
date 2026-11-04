"use client";

import { useState } from "react";
import { BellRing, CalendarCheck, Check, Lock, MessageCircle, UserPlus, X } from "lucide-react";
import { Badge, Button, Card, Grid } from "@/components/ui";
import type { Acompanante, CitaAgenda, Modalidad } from "@/lib/data/de";

const campo = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm";
const DIAS = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07"];
const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" });
const dia = (iso: string, o: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric" }) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("es-VE", o);
const wa = (tel: string, txt: string) => `https://wa.me/${tel.replace(/\D/g, "").replace(/^0/, "58")}?text=${encodeURIComponent(txt)}`;
const TONO_MOD: Record<Modalidad, string> = { "Dirección espiritual": "var(--series-1)", "Diálogo apostólico": "var(--series-2)" };

export function AgendaDE({ acompanantes: ini, citas: citasIni, dirigidos, hoy }: { acompanantes: Acompanante[]; citas: CitaAgenda[]; dirigidos: Record<string, { id: string; nombre: string; ultima: string; sesiones: number }[]>; hoy: string }) {
  const [acomp, setAcomp] = useState(ini);
  const [citas, setCitas] = useState(citasIni);
  const [vista, setVista] = useState("admin");
  const [diaMsg, setDiaMsg] = useState(DIAS[0]);
  const [nuevo, setNuevo] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [avisados, setAvisados] = useState<string[]>([]);

  const visibles = vista === "admin" ? acomp : acomp.filter((a) => a.id === vista);
  const deVista = citas.filter((c) => visibles.some((a) => a.id === c.acompananteId));
  const nombreA = (id: string) => acomp.find((a) => a.id === id)?.nombre ?? "";
  const sinMarcar = deVista.filter((c) => c.estado === "sin_marcar");
  const marcar = (id: string, estado: CitaAgenda["estado"]) => setCitas((l) => l.map((c) => (c.id === id ? { ...c, estado } : c)));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-3">
        <label className="flex items-center gap-2 text-sm font-semibold">Ver como
          <select value={vista} onChange={(e) => setVista(e.target.value)} className={campo}>
            <option value="admin">Administrador (todos)</option>
            {acomp.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </label>
        {vista !== "admin" ? <span className="inline-flex items-center gap-1 text-xs text-muted"><Lock size={14} aria-hidden />Cada director ve solo sus citas y sus dirigidos.</span> : null}
        <span className="ml-auto"><Button onClick={() => setNuevo((v) => !v)}><UserPlus size={16} aria-hidden />Añadir director o acompañante</Button></span>
      </div>

      {nuevo ? (
        <Card title="Nuevo director espiritual o acompañante" subtitle="Requisito: conectar su Google Calendar para leer solo las citas de su Agenda de citas">
          <form className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }} onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const mods = (["Dirección espiritual", "Diálogo apostólico"] as Modalidad[]).filter((m) => f.get(m) === "on");
            setAcomp((l) => [...l, { id: `n${l.length}`, nombre: String(f.get("nombre")), tipo: f.get("tipo") as Acompanante["tipo"], modalidades: mods.length ? mods : ["Dirección espiritual"], calendarioConectado: true, enlaceAgenda: String(f.get("agenda")), telefono: String(f.get("telefono")) }]);
            setNuevo(false); setConectado(false);
          }}>
            <label className="flex flex-col gap-1 text-sm font-semibold">Nombre<input name="nombre" required className={campo} /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Tipo<select name="tipo" className={campo}><option value="laico">Laico formado</option><option value="sacerdote">Sacerdote</option></select></label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Teléfono<input name="telefono" type="tel" required className={campo} /></label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Enlace de su Agenda de citas<input name="agenda" type="url" required placeholder="https://calendar.app.google/…" className={campo} /></label>
            <fieldset className="col-span-full flex flex-wrap gap-4"><legend className="mb-1 text-sm font-semibold">Qué da</legend>
              <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="Dirección espiritual" defaultChecked className="size-4" />Dirección espiritual</label>
              <label className="inline-flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="Diálogo apostólico" className="size-4" />Diálogo apostólico</label>
            </fieldset>
            <div className="col-span-full flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => setConectado(true)}><CalendarCheck size={16} aria-hidden />{conectado ? "Google Calendar conectado" : "Conectar Google Calendar"}</Button>
              <Button type="submit" disabled={!conectado}>Guardar</Button>
              {!conectado ? <span className="text-xs text-muted">Sin el calendario conectado no se puede guardar.</span> : null}
            </div>
          </form>
        </Card>
      ) : null}

      <Card title="Semana del 2 al 7 de noviembre" subtitle="Citas leídas de la Agenda de citas de cada director">
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {(Object.keys(TONO_MOD) as Modalidad[]).map((m) => <span key={m} className="inline-flex items-center gap-1"><span className="size-3 rounded-sm" style={{ background: TONO_MOD[m] }} />{m}</span>)}
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-6 gap-2">
            {DIAS.map((d) => (
              <div key={d} className={`flex flex-col gap-1.5 rounded-xl p-2 ${d === hoy ? "bg-accent-soft" : "bg-surface-2"}`}>
                <strong className="text-xs capitalize">{dia(d)}</strong>
                {deVista.filter((c) => c.inicio.startsWith(d)).map((c) => (
                  <div key={c.id} className="rounded-lg bg-surface p-1.5 text-[11px] leading-tight" style={{ boxShadow: `inset 3px 0 0 ${TONO_MOD[c.modalidad]}` }}>
                    <strong className="block">{hora(c.inicio)} · {c.persona}</strong>
                    <span className="text-muted">{vista === "admin" ? nombreA(c.acompananteId) : c.modalidad}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Grid min={320}>
        <Card title="Próximas por director">
          <div className="flex flex-col gap-3">
            {visibles.map((a) => {
              const prox = citas.filter((c) => c.acompananteId === a.id && c.estado === "agendada").slice(0, 3);
              return (
                <div key={a.id} className="flex flex-col gap-1">
                  <span className="flex items-center justify-between gap-2 text-sm"><strong>{a.nombre}</strong><span className="flex gap-1">{a.modalidades.map((m) => <Badge key={m} tone={m === "Diálogo apostólico" ? "accent" : "neutral"}>{m === "Diálogo apostólico" ? "Diálogo" : "DE"}</Badge>)}</span></span>
                  <ul className="flex flex-col text-xs">
                    {prox.map((c) => <li key={c.id} className="flex justify-between gap-2 border-b border-border py-1 last:border-0"><span>{c.persona}</span><span className="text-muted">{dia(c.inicio)} · {hora(c.inicio)}</span></li>)}
                    {!prox.length ? <li className="text-muted">Sin citas esta semana.</li> : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Confirmar las citas del día" subtitle="Mensaje para quien da la DE con la lista del día">
          <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Día<select value={diaMsg} onChange={(e) => setDiaMsg(e.target.value)} className={`${campo} text-ink`}>{DIAS.map((d) => <option key={d} value={d}>{dia(d, { weekday: "long", day: "numeric", month: "long" })}</option>)}</select></label>
          <ul className="flex flex-col">
            {visibles.map((a) => {
              const hoyC = citas.filter((c) => c.acompananteId === a.id && c.inicio.startsWith(diaMsg));
              const txt = `¡Hola, ${a.nombre}! Tus citas de ${dia(diaMsg, { weekday: "long", day: "numeric" })}:\n${hoyC.map((c) => `• ${hora(c.inicio)} ${c.persona} (${c.modalidad})`).join("\n")}\n¿Las confirmamos?`;
              return (
                <li key={a.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
                  <span className="flex flex-col"><strong>{a.nombre}</strong><span className="text-xs text-muted">{hoyC.length} cita{hoyC.length === 1 ? "" : "s"}</span></span>
                  {hoyC.length ? <a href={wa(a.telefono, txt)} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-brand px-2.5 text-xs font-bold text-white no-underline"><MessageCircle size={14} aria-hidden />Enviar</a> : <span className="text-xs text-muted">Libre</span>}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Sin marcar al final del día" subtitle="A las 9:00 p. m. se avisa al director para que marque si se hicieron" action={<Badge tone={sinMarcar.length ? "warn" : "good"}>{sinMarcar.length}</Badge>}>
          <ul className="flex flex-col gap-2">
            {sinMarcar.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-2 p-2 text-sm">
                <span className="flex flex-col"><strong>{c.persona}</strong><span className="text-xs text-muted">{nombreA(c.acompananteId)} · {dia(c.inicio)} {hora(c.inicio)}</span></span>
                <span className="flex gap-1">
                  <button type="button" aria-label="Se realizó" onClick={() => marcar(c.id, "realizada")} className="inline-flex size-9 items-center justify-center rounded-lg bg-brand text-white"><Check size={16} /></button>
                  <button type="button" aria-label="No se realizó" onClick={() => marcar(c.id, "no_realizada")} className="inline-flex size-9 items-center justify-center rounded-lg border border-border"><X size={16} /></button>
                </span>
              </li>
            ))}
            {!sinMarcar.length ? <li className="text-sm text-muted">Todo marcado.</li> : null}
          </ul>
          {sinMarcar.length ? <Button variant="secondary" onClick={() => setAvisados(sinMarcar.map((c) => c.acompananteId))}><BellRing size={16} aria-hidden />{avisados.length ? "Recordatorio enviado" : "Recordar ahora a los directores"}</Button> : null}
        </Card>
      </Grid>

      <Card title="Jóvenes que atiende cada director" subtitle="Con al menos una DE desde mayo">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))" }}>
          {visibles.filter((a) => dirigidos[a.id]).map((a) => (
            <div key={a.id} className="flex flex-col gap-1">
              <span className="flex items-center justify-between text-sm"><strong>{a.nombre}</strong><Badge>{dirigidos[a.id].length}</Badge></span>
              <ul className="flex max-h-56 flex-col overflow-y-auto text-xs">
                {dirigidos[a.id].map((p) => <li key={p.id} className="flex justify-between gap-2 border-b border-border py-1 last:border-0"><span>{p.nombre}</span><span className="text-muted">{p.sesiones} DE · última {dia(p.ultima, { day: "numeric", month: "short" })}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

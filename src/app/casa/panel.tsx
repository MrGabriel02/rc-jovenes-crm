"use client";

import { useState } from "react";
import { Badge, Button, Card, Grid, Kpi, Table } from "@/components/ui";
import { BarrasHorizontales } from "@/components/charts";
import { estadoReserva, precioReserva, finReserva, COWORKING, CAFETIN, cobroCafetin } from "@/lib/domain/reservas";
import { usd } from "@/lib/domain/economia";
import type { Espacio, Reserva } from "@/lib/domain/types";
import type * as CasaData from "@/lib/data/casa";
import type { Camara } from "@/lib/data/camaras";
import { MapaCasa } from "./mapa";
import { FlujoCoworking } from "./flujo-coworking";

const TABS = ["Mapa", "Reservas", "Coworking", "Cafetín y gastos", "Inventario", "Mantenimiento y limpieza"] as const;

export function PanelCasa({ espacios, reservas, directores, casa, camaras, ahora }: { espacios: Espacio[]; reservas: Reserva[]; directores: string[]; casa: typeof CasaData; camaras: Camara[]; ahora: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Mapa");
  const [lista, setLista] = useState(reservas);
  const [interesados, setInteresados] = useState<Record<string, string[]>>(() => Object.fromEntries(Object.entries(casa.INTERESADOS).map(([k, v]) => [k, [...v]])));
  const ETAPAS = Object.keys(casa.INTERESADOS);
  const mover = (de: string, x: string, paso: number) => setInteresados((m) => {
    const a = ETAPAS[ETAPAS.indexOf(de) + paso];
    return a ? { ...m, [de]: m[de].filter((y) => y !== x), [a]: [x, ...m[a]] } : m;
  });
  const espacio = (id: string) => espacios.find((e) => e.id === id)!;
  const aprobar = (id: string, dir: string) => setLista((l) => l.map((r) => (r.id === id && !r.aprobaciones.includes(dir) ? { ...r, aprobaciones: [...r.aprobaciones, dir] } : r)));
  const rechazar = (id: string, dir: string) => setLista((l) => l.map((r) => (r.id === id ? { ...r, rechazadaPor: dir } : r)));
  const hora = (d: Date | string) => new Date(d).toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" });

  return (
    <>
      <div role="tablist" aria-label="Secciones de la casa" className="flex flex-wrap gap-1 self-start rounded-xl bg-surface-2 p-1">
        {TABS.map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${tab === t ? "bg-surface shadow-sm" : "text-muted"}`}>{t}</button>
        ))}
      </div>

      {tab === "Mapa" ? (
        <MapaCasa espacios={espacios} reservas={reservas} directores={directores} camaras={camaras} mantenimiento={casa.MANTENIMIENTO} ahora={ahora} />
      ) : null}

      {tab === "Reservas" ? (
        <>
          <Grid min={360}>
            <Card title="Solicitudes por aprobar" subtitle="Aprueban los dos directores de sección; al aprobarse se crea el evento en el calendario de la casa">
              <ul className="flex flex-col gap-2">
                {lista.filter((r) => estadoReserva(r, directores) === "pendiente").map((r) => {
                  const e = espacio(r.espacioId);
                  return (
                    <li key={r.id} className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2"><strong>{e.nombre} · {new Date(r.inicio).toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" })} {hora(r.inicio)}–{hora(finReserva(r))}</strong><Badge tone="accent">{usd(precioReserva(e.tipo, r.bloques, r.tipoSolicitante))}</Badge></div>
                      <span className="text-xs text-muted">{r.solicitante} · {r.motivo} · Aprobaciones: {r.aprobaciones.length} de {directores.length}</span>
                      <div className="flex flex-wrap gap-2">
                        {directores.map((d, i) => (
                          <Button key={d} variant={r.aprobaciones.includes(d) ? "secondary" : "primary"} disabled={r.aprobaciones.includes(d)} onClick={() => aprobar(r.id, d)}>{r.aprobaciones.includes(d) ? `Director ${i + 1} aprobó` : `Aprobar como director ${i + 1}`}</Button>
                        ))}
                        <Button variant="secondary" onClick={() => rechazar(r.id, directores[0])}>Rechazar</Button>
                      </div>
                    </li>
                  );
                })}
                {!lista.some((r) => estadoReserva(r, directores) === "pendiente") ? <li className="text-sm text-muted">No hay solicitudes pendientes.</li> : null}
              </ul>
            </Card>
            <Card title="Próximas reservas aprobadas">
              <ul className="flex flex-col gap-2 text-sm">
                {lista.filter((r) => estadoReserva(r, directores) === "aprobada").sort((a, b) => a.inicio.localeCompare(b.inicio)).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0">
                    <span className="flex flex-col"><strong>{espacio(r.espacioId).nombre}</strong><span className="text-xs text-muted">{new Date(r.inicio).toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" })} · {hora(r.inicio)} · {r.solicitante}</span></span>
                    {r.recurrente ? <Badge tone="accent">Semanal</Badge> : <Badge tone="good">Aprobada</Badge>}
                  </li>
                ))}
              </ul>
            </Card>
          </Grid>
          <Card title="Espacios y tarifas" subtitle="Por bloque de 1,5 h. Los apostolados de la sección no pagan; otras secciones y externos pagan la tarifa completa.">
            <Table head={["Espacio", "Capacidad", "Tarifa", "Reservas en noviembre"]} minWidth={520}>
              {espacios.map((e) => (
                <tr key={e.id}><td className="font-semibold">{e.nombre}</td><td>{e.capacidad ?? "—"}</td><td>{precioReserva(e.tipo, 1, "externo") ? usd(precioReserva(e.tipo, 1, "externo")) : "Sin costo"}</td><td>{lista.filter((r) => r.espacioId === e.id).length}</td></tr>
              ))}
            </Table>
          </Card>
        </>
      ) : null}

      {tab === "Coworking" ? (
        <>
          <Grid min={200}>
            <Kpi label="Miembros activos" value={casa.COWORKING_MIEMBROS.filter((m) => m.plan === "Mensual").length} note={`Membresía de ${usd(COWORKING.mensual)} al mes`} />
            <Kpi label="Pagos vencidos" value={casa.COWORKING_MIEMBROS.filter((m) => !m.pagado).length} tone="warn" />
            <Kpi label="Interesados en seguimiento" value={interesados.Contacto.length + interesados.Visita.length + interesados.Prueba.length} />
            <Kpi label="Horario" value={<span className="text-base">{COWORKING.horario}</span>} />
          </Grid>
          <Card title="Cómo funciona el coworking" subtitle="Flujo de trabajo de que llega un interesado hasta que renueva cada mes">
            <FlujoCoworking />
          </Card>
          <Card title="Interesados en el coworking" subtitle="De contacto a miembro. Usa las flechas para pasar a alguien a la etapa siguiente.">
            <div className="grid gap-3 overflow-x-auto pb-1" style={{ gridTemplateColumns: "repeat(5, minmax(190px, 1fr))" }}>
              {Object.entries(interesados).map(([etapa, xs], k) => (
                <div key={etapa} className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
                  <strong className="text-sm">{etapa} <span className="font-normal text-muted">({xs.length})</span></strong>
                  {xs.map((x) => (
                    <span key={x} className="flex items-center gap-1 rounded-lg border border-border bg-surface p-2 text-xs">
                      <span className="flex-1">{x}</span>
                      {k > 0 ? <button type="button" aria-label={`Regresar a ${ETAPAS[k - 1]}`} onClick={() => mover(etapa, x, -1)} className="rounded p-1 text-muted hover:bg-surface-2 hover:text-ink">←</button> : null}
                      {k < ETAPAS.length - 1 ? <button type="button" aria-label={`Pasar a ${ETAPAS[k + 1]}`} onClick={() => mover(etapa, x, 1)} className="rounded p-1 text-muted hover:bg-surface-2 hover:text-ink">→</button> : null}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Card>
          <Card title="Miembros">
            <Table head={["Miembro", "Plan", "Desde", "Vence", "Pago"]} minWidth={520}>
              {casa.COWORKING_MIEMBROS.map((m) => (
                <tr key={m.nombre}><td className="font-semibold">{m.nombre}</td><td>{m.plan}</td><td>{m.desde}</td><td>{m.vence}</td><td>{m.pagado ? <Badge tone="good">Pagado</Badge> : <Badge tone="warn">Pendiente</Badge>}</td></tr>
              ))}
            </Table>
          </Card>
        </>
      ) : null}

      {tab === "Cafetín y gastos" ? (
        <Grid min={340}>
          <Card title="Cierre del cafetín · octubre" subtitle={`Paga el ${CAFETIN.porcentajeVentas * 100} % de cada venta más ${usd(CAFETIN.alquilerMensual)} de alquiler mensual`}>
            {(() => {
              const c = cobroCafetin([...casa.VENTAS_CAFETIN_OCTUBRE]);
              return (
                <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-sm">
                  <dt>Ventas reportadas ({casa.VENTAS_CAFETIN_OCTUBRE.length} días)</dt><dd className="text-right">{usd(c.totalVentas)}</dd>
                  <dt>{CAFETIN.porcentajeVentas * 100} % de las ventas</dt><dd className="text-right">{usd(c.porcentaje)}</dd>
                  <dt>Alquiler mensual</dt><dd className="text-right">{usd(c.alquiler)}</dd>
                  <dt className="font-bold">Total a cobrar</dt><dd className="text-right font-bold">{usd(c.total)}</dd>
                </dl>
              );
            })()}
            <p className="text-xs text-muted">Las ventas son simuladas. El porcentaje y el alquiler son los del acuerdo.</p>
          </Card>
          <Card title="Gastos fijos de la casa" subtitle="Octubre, en dólares">
            <BarrasHorizontales data={casa.GASTOS_FIJOS} x="concepto" y="monto" nombre="Gasto" sufijo=" $" color="var(--series-1)" />
          </Card>
        </Grid>
      ) : null}

      {tab === "Inventario" ? (
        <Card title="Inventario de closets" subtitle="Préstamos a apostolados con fecha de devolución">
          <Table head={["Closet", "División", "Artículo", "Cantidad", "Préstamo"]} minWidth={640}>
            {casa.INVENTARIO.map((i) => (
              <tr key={i.articulo}><td>{i.closet}</td><td>{i.division}</td><td className="font-semibold">{i.articulo}</td><td>{i.cantidad}</td><td>{i.prestado ? <Badge tone={i.prestado.includes("vencido") ? "warn" : "accent"}>{i.prestado}</Badge> : "En el closet"}</td></tr>
            ))}
          </Table>
        </Card>
      ) : null}

      {tab === "Mantenimiento y limpieza" ? (
        <Grid min={340}>
          <Card title="Reportes de mantenimiento" subtitle="Se reportan desde el teléfono con foto">
            <ul className="flex flex-col gap-2 text-sm">
              {casa.MANTENIMIENTO.map((m) => (
                <li key={m.titulo} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 p-3">
                  <span className="flex flex-col"><strong>{m.titulo}</strong><span className="text-xs text-muted">{m.fecha}{m.costo ? ` · ${usd(m.costo)}` : ""}</span></span>
                  <Badge tone={m.estado === "Resuelto" ? "good" : m.estado === "En proceso" ? "accent" : "warn"}>{m.estado}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Limpieza de hoy" subtitle="Checklist diario por área">
            <ul className="flex flex-col gap-2 text-sm">
              {casa.LIMPIEZA.map((l) => (
                <li key={l.area}><label className="flex min-h-10 items-center gap-3"><input type="checkbox" defaultChecked={l.hecho} className="size-5 accent-brand" />{l.area}</label></li>
              ))}
            </ul>
          </Card>
        </Grid>
      ) : null}
    </>
  );
}

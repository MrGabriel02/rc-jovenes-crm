"use client";

import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Caracas", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" });

/** Fecha (AAAA-MM-DD) y hora de Barquisimeto, sin depender de la zona del teléfono. */
function ahoraCaracas() {
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}`;
}

function suscribir(avisar: () => void) {
  // Revisa cada minuto: así la fecha cambia sola a medianoche aunque la página quede abierta.
  const t = setInterval(avisar, 60_000);
  document.addEventListener("visibilitychange", avisar);
  return () => { clearInterval(t); document.removeEventListener("visibilitychange", avisar); };
}

/**
 * Día real de hoy en Venezuela. En el servidor (página ya generada) devuelve `respaldo`,
 * y en el navegador se actualiza al día real. Los datos simulados siguen en su fecha fija.
 */
export function useHoy(respaldo: string) {
  const v = useSyncExternalStore(suscribir, ahoraCaracas, () => respaldo);
  const fecha = v.slice(0, 10);
  const hora = Number(v.slice(11, 13));
  return { fecha, hora, date: new Date(`${fecha}T12:00:00`) };
}

export const saludoPorHora = (h: number) => (h < 5 || h >= 19 ? "Buenas noches" : h < 12 ? "Buenos días" : "Buenas tardes");

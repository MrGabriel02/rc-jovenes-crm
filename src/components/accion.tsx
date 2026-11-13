"use client";

import { useState, type ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "./ui";

/**
 * Botón de una acción que en la demostración no sale de la plataforma (enviar, sincronizar):
 * muestra que está trabajando y luego confirma lo hecho.
 */
export function BotonAccion({ children, hecho, variant = "primary", className }: { children: ReactNode; hecho: string; variant?: "primary" | "secondary"; className?: string }) {
  const [estado, setEstado] = useState<"listo" | "trabajando" | "hecho">("listo");
  return (
    <Button variant={variant} className={className} disabled={estado !== "listo"} aria-live="polite" onClick={() => { setEstado("trabajando"); setTimeout(() => setEstado("hecho"), 900); }}>
      {estado === "trabajando" ? <><Loader2 size={16} aria-hidden className="animate-spin" />Un momento…</> : estado === "hecho" ? <><Check size={16} aria-hidden />{hecho}</> : children}
    </Button>
  );
}

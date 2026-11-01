"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";

export function Confirmaciones({ sesiones }: { sesiones: { id: string; persona: string; director: string; inicio: string }[] }) {
  const [res, setRes] = useState<Record<string, "realizada" | "no_realizada">>({});
  return (
    <Card title="¿Se realizó la DE?" subtitle="Lo que recibe el director como notificación al terminar cada cita. Sin respuesta en 48 h queda “sin confirmar” y no suma.">
      <ul className="flex flex-col gap-2">
        {sesiones.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3">
            <div className="flex min-w-48 flex-1 flex-col">
              <strong className="text-sm">{s.persona}</strong>
              <span className="text-xs text-muted">{s.director} · {new Date(s.inicio).toLocaleString("es-VE", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            {res[s.id] ? (
              <Badge tone={res[s.id] === "realizada" ? "good" : "neutral"}>{res[s.id] === "realizada" ? "Realizada" : "No se realizó"}</Badge>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setRes((r) => ({ ...r, [s.id]: "realizada" }))}>Sí, se realizó</Button>
                <Button variant="secondary" onClick={() => setRes((r) => ({ ...r, [s.id]: "no_realizada" }))}>No</Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="self-start">Registrar una DE acordada en persona</Button>
    </Card>
  );
}

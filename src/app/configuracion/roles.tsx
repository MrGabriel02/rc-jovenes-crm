"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { MODULOS } from "@/components/nav";
import type { Modulo, Rol } from "@/lib/domain/types";

const CLAVE: Record<string, Modulo> = {
  "/": "inicio", "/personas": "personas", "/calendario": "calendario", "/seguimiento": "seguimiento", "/equipos": "equipos",
  "/direccion-espiritual": "direccion", "/apostolados": "apostolados", "/formacion": "formacion", "/retiros": "retiros",
  "/economia": "economia", "/casa": "casa", "/camaras": "camaras", "/comunicaciones": "comunicaciones", "/documentos": "documentos", "/configuracion": "configuracion", "/promocion": "promocion", "/notificaciones": "notificaciones", "/albumes": "albumes",
};
const SIG = { undefined: "leer", leer: "editar", editar: undefined } as const;
const ALCANCE = { todo: "Todo", apostolado: "Su apostolado", equipo: "Su equipo", dirigidos: "Sus dirigidos" };

export function MatrizRoles({ roles }: { roles: Rol[] }) {
  const [rs, setRs] = useState(roles);
  const ciclar = (rid: string, m: Modulo) =>
    setRs((xs) => xs.map((r) => (r.id === rid ? { ...r, permisos: { ...r.permisos, [m]: SIG[String(r.permisos[m]) as keyof typeof SIG] } } : r)));

  return (
    <Card title="Roles y permisos" subtitle="Toca una celda para alternar: sin acceso → ver → editar. Se pueden crear roles nuevos." action={<Button variant="secondary">Nuevo rol</Button>}>
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] text-xs">
          <thead>
            <tr className="text-left text-muted">
              <th className="sticky left-0 bg-surface px-2 py-2 font-semibold">Rol</th>
              <th className="px-2 py-2 font-semibold">Alcance</th>
              {MODULOS.map((m) => <th key={m.href} className="px-1 py-2 text-center font-semibold">{m.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rs.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="sticky left-0 bg-surface px-2 py-2 text-sm font-semibold">{r.nombre}</td>
                <td className="px-2 py-2">{ALCANCE[r.alcance]}</td>
                {MODULOS.map((m) => {
                  const p = r.permisos[CLAVE[m.href]];
                  return (
                    <td key={m.href} className="px-1 py-1 text-center">
                      <button type="button" onClick={() => ciclar(r.id, CLAVE[m.href])} aria-label={`${r.nombre}, ${m.label}: ${p ?? "sin acceso"}`}
                        className={`min-h-9 w-16 rounded-md text-[11px] font-bold ${p === "editar" ? "bg-brand text-white" : p === "leer" ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"}`}>
                        {p === "editar" ? "Editar" : p === "leer" ? "Ver" : "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

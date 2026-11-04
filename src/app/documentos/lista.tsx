"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge, Card, Table } from "@/components/ui";
import type { Documento } from "@/lib/data/documentos";

export function ListaDocumentos({ documentos, areas }: { documentos: Documento[]; areas: { id: string; nombre: string }[] }) {
  const params = useSearchParams();
  const [area, setArea] = useState(params.get("area") ?? "");
  const [tipo, setTipo] = useState("");
  const tipos = [...new Set(documentos.map((d) => d.tipo))];
  const lista = documentos.filter((d) => (!area || d.areaId === area) && (!tipo || d.tipo === tipo)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const nombre = (id: string) => areas.find((a) => a.id === id)?.nombre ?? id;
  const sel = "min-h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink";
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Apostolado o área
          <select value={area} onChange={(e) => setArea(e.target.value)} className={sel}>
            <option value="">Todos</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={sel}>
            <option value="">Todos</option>
            {tipos.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <Card title={`${lista.length} documentos`}>
        <Table head={["Documento", "Tipo", "Área", "Fecha"]} minWidth={560}>
          {lista.map((d) => (
            <tr key={d.nombre}>
              <td className="font-semibold"><a href="#" className="text-ink">{d.nombre}</a></td>
              <td><Badge>{d.tipo}</Badge></td>
              <td>{nombre(d.areaId)}</td>
              <td className="tabular-nums">{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-VE")}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

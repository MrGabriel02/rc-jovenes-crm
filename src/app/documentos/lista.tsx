"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FileUp } from "lucide-react";
import { Badge, Button, Card, Table } from "@/components/ui";
import type { Documento } from "@/lib/data/documentos";

const DRIVE = "https://drive.google.com/drive/folders/1rbCxHNNKvcpGCvNWOkH9vmFyZYpQFt_8";

export function ListaDocumentos({ documentos: ini, areas }: { documentos: Documento[]; areas: { id: string; nombre: string }[] }) {
  const [documentos, setDocumentos] = useState<(Documento & { url?: string })[]>(ini);
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
            <tr key={d.nombre + d.fecha}>
              <td className="font-semibold">{"url" in d && d.url ? <a href={d.url} download={d.nombre} className="text-ink">{d.nombre}</a> : <a href={DRIVE} target="_blank" rel="noreferrer" className="text-ink">{d.nombre}</a>}</td>
              <td><Badge>{d.tipo}</Badge></td>
              <td>{nombre(d.areaId)}</td>
              <td className="tabular-nums">{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-VE")}</td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card id="subir" title="Subir documento" subtitle="Se guarda en la carpeta de Drive del área que elijas">
        <form className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))" }} onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const archivo = f.get("archivo") as File;
          if (!archivo?.name) return;
          setDocumentos((l) => [{ nombre: archivo.name, tipo: String(f.get("tipo")), areaId: String(f.get("area")), fecha: new Date().toISOString().slice(0, 10), url: URL.createObjectURL(archivo) }, ...l]);
          setArea(""); setTipo("");
          e.currentTarget.reset();
        }}>
          <label className="flex flex-col gap-1 text-sm font-semibold">Área<select name="area" className={sel}>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
          <label className="flex flex-col gap-1 text-sm font-semibold">Tipo<select name="tipo" className={sel}>{tipos.map((t) => <option key={t}>{t}</option>)}</select></label>
          <label className="col-span-full flex flex-col gap-1 text-sm font-semibold">Archivo<input name="archivo" type="file" required className="rounded-xl border border-dashed border-border bg-surface p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:font-semibold file:text-white" /></label>
          <p className="col-span-full text-xs text-muted">En la demostración el archivo queda en este navegador. Los documentos simulados abren la carpeta de Drive de la sección.</p>
          <div className="col-span-full"><Button type="submit"><FileUp size={16} aria-hidden />Subir</Button></div>
        </form>
      </Card>
    </>
  );
}

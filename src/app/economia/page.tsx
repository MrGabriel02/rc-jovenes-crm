import { Suspense } from "react";
import { AvisoSimulado, PageHeader } from "@/components/ui";
import { db, nombreArea, deudores } from "@/lib/data/repo";
import { PanelEconomia } from "./panel";
import { InformesApostolados, type FilaInforme } from "./informes";
import { HISTORIAL } from "@/lib/data/historial";
import { HOY } from "@/lib/domain/fechas";
import { DocumentosEconomia, type DocEconomia } from "./documentos";
import { AccionesEconomia, AporteLocalidad, Conversor, type FilaAporte } from "./extras";

const slug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s,'-]/g, "").trim();
const sumar = (iso: string, d: number) => { const x = new Date(`${iso}T12:00:00`); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };

export const metadata = { title: "Economía" };

export default function Economia() {
  const areas = [...new Set(db.movimientos.map((m) => m.areaId))].map((id) => ({ id, nombre: nombreArea(id) }));
  const deuda = deudores("adviento26").filter((d) => d.deuda > 0);
  const hoy = HOY.toISOString().slice(0, 10);
  // Informes desde 2025: los de más de dos meses están entregados salvo algunos, para mostrar pendientes.
  const informes: FilaInforme[] = HISTORIAL.filter((e) => e.fecha >= "2025-01-01").map((e, i) => {
    const viejo = e.fecha < "2026-09-01";
    const entregado = e.fecha < hoy && (viejo ? i % 7 !== 3 : i % 3 === 0);
    const d = new Date(`${e.fecha}T12:00:00`); d.setDate(d.getDate() + 5);
    return { id: e.id, apostoladoId: e.apostoladoId, apostolado: db.apostolados.find((a) => a.id === e.apostoladoId)!.nombre, retiro: e.nombre, fecha: e.fecha, entregado: entregado ? d.toISOString().slice(0, 10) : null, ingresosUSD: entregado ? e.ingresosUSD : null, gastosUSD: entregado ? e.gastosUSD : null, hoja: entregado && e.fuenteEconomia === "hoja" };
  });
  const nombreAp = (id: string) => db.apostolados.find((a) => a.id === id)?.nombre ?? id;
  // Cada informe entregado deja su tabla de Excel; algunos también el reporte en Word o PDF.
  const docs: DocEconomia[] = informes.filter((f) => f.entregado).flatMap((f, i) => {
    const base = { apostoladoId: f.apostoladoId, retiro: f.retiro, subido: f.entregado!, subidoPor: `Ecónomo de ${nombreAp(f.apostoladoId)}`, ingresosUSD: f.ingresosUSD, gastosUSD: f.gastosUSD, revisado: f.entregado! < sumar(hoy, -20) || i % 4 === 1 };
    const out: DocEconomia[] = [{ ...base, id: `${f.id}-x`, archivo: `Economía ${slug(f.retiro)}.xlsx`, formato: "Excel" }];
    if (i % 3 !== 2) out.push({ ...base, id: `${f.id}-w`, archivo: `Reporte económico ${slug(f.retiro)}.${i % 5 === 0 ? "pdf" : "docx"}`, formato: i % 5 === 0 ? "PDF" : "Word", subido: sumar(f.entregado!, 1) });
    return out;
  });
  const anio = 2026;
  const aportes: FilaAporte[] = db.apostolados.map((a, i) => {
    const xs = informes.filter((f) => f.apostoladoId === a.id && f.entregado && f.fecha.startsWith(String(anio)));
    return { apostoladoId: a.id, apostolado: a.nombre, retiros: xs.length, ganancia: Math.round(xs.reduce((s, f) => s + (f.ingresosUSD ?? 0) - (f.gastosUSD ?? 0), 0)), transferido: i % 3 !== 1 };
  }).filter((f) => f.retiros);
  return (
    <>
      <PageHeader
        title="Economía"
        description={`Cada movimiento en su moneda, con la tasa BCV del día (hoy simulada en Bs ${db.TASA_BCV_HOY}). El 10 % para la localidad se calcula sobre la ganancia.`}
        actions={<AccionesEconomia movimientos={db.movimientos} areas={areas} mes={{ clave: "10", nombre: "octubre 2026" }} />}
      />
      <AvisoSimulado />
      <Suspense>
        <PanelEconomia movimientos={db.movimientos} areas={areas} deudores={deuda.slice(0, 8).map((d) => ({ id: d.id, nombre: `${d.persona.nombre} ${d.persona.apellido}`, deuda: Math.round(d.deuda), pagado: Math.round(d.pagado) }))} totalDeudores={deuda.length} />
      </Suspense>
      <InformesApostolados filas={informes} hoy={hoy} apostolados={db.apostolados.map((a) => ({ id: a.id, nombre: a.nombre }))} />
      <DocumentosEconomia inicial={docs} hoy={hoy} apostolados={db.apostolados.map((a) => ({ id: a.id, nombre: a.nombre }))} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <AporteLocalidad inicial={aportes} anio={anio} />
        <Conversor tasaInicial={db.TASA_BCV_HOY} />
      </div>
    </>
  );
}

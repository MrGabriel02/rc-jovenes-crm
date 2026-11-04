import { Suspense } from "react";
import { AvisoSimulado, PageHeader, LinkButton } from "@/components/ui";
import { db, nombreArea, deudores } from "@/lib/data/repo";
import { PanelEconomia } from "./panel";
import { InformesApostolados, type FilaInforme } from "./informes";
import { HISTORIAL } from "@/lib/data/historial";
import { HOY } from "@/lib/domain/fechas";

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
  return (
    <>
      <PageHeader
        title="Economía"
        description={`Cada movimiento en su moneda, con la tasa BCV del día (hoy simulada en Bs ${db.TASA_BCV_HOY}). El 10 % para la localidad se calcula sobre la ganancia.`}
        actions={<><LinkButton href="#" variant="secondary">Exportar a Excel</LinkButton><LinkButton href="#">Generar informe mensual (Word)</LinkButton></>}
      />
      <AvisoSimulado />
      <Suspense>
        <PanelEconomia movimientos={db.movimientos} areas={areas} deudores={deuda.slice(0, 8).map((d) => ({ id: d.id, nombre: `${d.persona.nombre} ${d.persona.apellido}`, deuda: Math.round(d.deuda), pagado: Math.round(d.pagado) }))} totalDeudores={deuda.length} />
      </Suspense>
      <InformesApostolados filas={informes} hoy={hoy} apostolados={db.apostolados.map((a) => ({ id: a.id, nombre: a.nombre }))} />
    </>
  );
}

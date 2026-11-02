import { Suspense } from "react";
import { AvisoSimulado, PageHeader, LinkButton } from "@/components/ui";
import { db, nombreArea, deudores } from "@/lib/data/repo";
import { PanelEconomia } from "./panel";

export const metadata = { title: "Economía" };

export default function Economia() {
  const areas = [...new Set(db.movimientos.map((m) => m.areaId))].map((id) => ({ id, nombre: nombreArea(id) }));
  const deuda = deudores("adviento26").filter((d) => d.deuda > 0);
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
    </>
  );
}

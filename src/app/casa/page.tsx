import { AvisoSimulado, PageHeader, LinkButton } from "@/components/ui";
import { db } from "@/lib/data/repo";
import * as casa from "@/lib/data/casa";
import { PanelCasa } from "./panel";

export const metadata = { title: "La casa" };

export default function Casa() {
  return (
    <>
      <PageHeader title="La casa" description="Reservas, coworking, cafetín, inventario, mantenimiento y limpieza. La usan Jóvenes, Señores y Jóvenes Señores." actions={<LinkButton href="/reservar" variant="secondary">Formulario público de reservas</LinkButton>} />
      <AvisoSimulado />
      <PanelCasa espacios={db.espacios} reservas={db.reservas} directores={db.DIRECTORES_SECCION} casa={casa} />
    </>
  );
}

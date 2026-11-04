import { AvisoSimulado, PageHeader, LinkButton } from "@/components/ui";
import { db } from "@/lib/data/repo";
import * as casa from "@/lib/data/casa";
import { CAMARAS } from "@/lib/data/camaras";
import { PanelCasa } from "./panel";

export const metadata = { title: "La casa" };

export default function Casa() {
  return (
    <>
      <PageHeader title="La casa" description="Toca un espacio del plano para ver su estado, sus reservas y sus cámaras. La casa la usan Jóvenes, Señores y Jóvenes Señores." actions={<LinkButton href="/reservar" variant="secondary">Formulario público de reservas</LinkButton>} />
      <AvisoSimulado />
      <PanelCasa espacios={db.espacios} reservas={db.reservas} directores={db.DIRECTORES_SECCION} casa={casa} camaras={CAMARAS} ahora="2026-11-01T09:00:00" />
    </>
  );
}

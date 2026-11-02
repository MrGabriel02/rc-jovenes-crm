import { Suspense } from "react";
import { db } from "@/lib/data/repo";
import { FormularioReserva } from "./formulario";

export const metadata = { title: "Solicitar un espacio" };

export default function Reservar() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold">Solicitar un espacio de la casa</h1>
        <p className="text-sm text-muted">Enlace público (también con QR). La solicitud queda pendiente hasta que la aprueben los directores de sección.</p>
      </header>
      <Suspense>
        <FormularioReserva espacios={db.espacios.filter((e) => e.tipo !== "cafetin")} reservas={db.reservas} />
      </Suspense>
    </>
  );
}

import Image from "next/image";
import { Suspense } from "react";
import { db } from "@/lib/data/repo";
import { FormularioInscripcion } from "./formulario";

export const metadata = { title: "Inscríbete" };

export default function Inscripcion() {
  const actividades = Object.fromEntries(db.actividades.map((a) => [a.id, a.nombre]));
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-[linear-gradient(140deg,#5b0d14_0%,#8a1b24_60%,#a3222b_100%)] px-6 py-8 text-center text-white">
        <Image src="/marca/rc-escudo.png" alt="Regnum Christi" width={64} height={64} priority className="size-16 rounded-full ring-2 ring-white/30" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Regnum Christi · Jóvenes Barquisimeto</span>
        <h1 className="font-serif text-4xl font-bold italic leading-tight sm:text-5xl">¡Venga tu Reino!</h1>
        <p className="max-w-md text-white/85">Déjanos tus datos para invitarte a encuentros, retiros y apostolados. Toma menos de un minuto.</p>
      </section>
      <Suspense>
        <FormularioInscripcion actividades={actividades} />
      </Suspense>
      <p className="text-center text-xs text-muted">Versión de demostración: los datos no se guardan.</p>
    </div>
  );
}

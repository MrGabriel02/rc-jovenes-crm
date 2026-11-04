"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui";

const campo = "min-h-12 rounded-2xl border border-border bg-surface px-4 text-base";

export function FormularioInscripcion({ actividades }: { actividades: Record<string, string> }) {
  const sp = useSearchParams();
  const origen = sp.get("origen") ?? "base";
  const actividad = actividades[origen];
  const [listo, setListo] = useState<string | null>(null);

  if (listo) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface p-8 text-center shadow-sm">
        <Heart size={36} aria-hidden className="text-brand" />
        <h2 className="font-serif text-3xl font-bold italic">¡Gracias, {listo}!</h2>
        <p className="text-ink-2">Ya eres parte de la familia de RC Jóvenes Barquisimeto. Pronto alguien de la sección te escribirá por WhatsApp.</p>
      </div>
    );
  }
  return (
    <form className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-sm sm:p-7" onSubmit={(e) => { e.preventDefault(); setListo(String(new FormData(e.currentTarget).get("nombre"))); }}>
      {actividad ? <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold">Inscripción a: {actividad}</p> : origen === "equipo" ? <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold">Quiero entrar a un equipo de encuentro</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold">Nombre<input name="nombre" required autoComplete="given-name" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Apellido<input name="apellido" required autoComplete="family-name" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Cédula<input name="cedula" inputMode="numeric" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Fecha de nacimiento<input name="nacimiento" type="date" required className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Teléfono (WhatsApp)<input name="telefono" type="tel" required autoComplete="tel" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Correo<input name="correo" type="email" autoComplete="email" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Profesión u ocupación<input name="profesion" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold">Ciudad<input name="ciudad" defaultValue="Barquisimeto" className={campo} /></label>
        <label className="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">¿Cómo nos conociste?
          <select name="como" className={campo}><option>Un amigo me invitó</option><option>Un retiro (Search, GPR, Kerigma…)</option><option>Mi colegio o universidad</option><option>Mi parroquia</option><option>Instagram</option><option>Otro</option></select>
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-1 size-5 accent-brand" />Acepto que la sección guarde mis datos para invitarme a sus actividades.</label>
      <Button type="submit">Inscribirme</Button>
    </form>
  );
}

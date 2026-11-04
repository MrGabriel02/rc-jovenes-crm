import { existsSync } from "node:fs";
import { join } from "node:path";
import { colorApostolado } from "@/lib/data/historial";

/**
 * Logo del apostolado: usa public/marca/apostolados/<id>.png si existe; si no, un monograma
 * con el color del apostolado.
 */
export function LogoApostolado({ id, nombre, size = 48 }: { id: string; nombre: string; size?: number }) {
  const archivo = `/marca/apostolados/${id}.png`;
  if (existsSync(join(process.cwd(), "public", archivo))) {
    // eslint-disable-next-line @next/next/no-img-element -- logos pequeños servidos tal cual
    return <img src={archivo} alt={`Logo de ${nombre}`} width={size} height={size} className="shrink-0 rounded-xl object-contain" />;
  }
  const ini = nombre.replace(/['’]s\b/g, "").split(/\s+/).filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w)).map((w) => w[0]).slice(0, 3).join("");
  return (
    <span aria-hidden title={nombre} style={{ width: size, height: size, background: colorApostolado(id), fontSize: size * 0.32 }}
      className="flex shrink-0 items-center justify-center rounded-xl font-extrabold tracking-tight text-white ring-2 ring-[var(--gold)]/60">
      {ini}
    </span>
  );
}

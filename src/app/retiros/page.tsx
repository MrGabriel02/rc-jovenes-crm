import { AvisoSimulado, PageHeader } from "@/components/ui";
import { db, formadores, nombreCompleto } from "@/lib/data/repo";
import { CUENTA_ALBUMES } from "@/lib/data/avisos";
import { CAMBIOS_SYNC, CAMPOS_FORMULARIO, EDICIONES, GASTOS_RETIRO, INVITADOS, MENUS, PAGOS, PROVEEDORES, TAREAS, TASA_BCV } from "@/lib/data/retiros";
import { PanelRetiros } from "./panel";

export const metadata = { title: "Retiros" };

/** Formadores que no fueron a ningún retiro de la sección ese año (simulado con un hash estable). */
function faltanPorEdicion() {
  const fs = formadores();
  const out: Record<string, { nombre: string; cargo: string; telefono: string }[]> = {};
  for (const e of EDICIONES) {
    out[e.id] = fs.filter((f, i) => (i * 7 + e.anio + (e.tipo === "ee" ? 3 : 0)) % 9 === 0).slice(0, 8)
      .map((f) => ({ nombre: nombreCompleto(f.persona), cargo: f.cargo, telefono: f.persona.telefono ?? "" }));
  }
  return out;
}

export default function Retiros() {
  return (
    <>
      <PageHeader title="Retiros de la sección" description="Triduo de renovación y Ejercicios Espirituales: cada año con su formulario, economía, seguimiento de invitados, menú y tareas." />
      <AvisoSimulado />
      <PanelRetiros d={{
        ediciones: EDICIONES, cambios: CAMBIOS_SYNC, menus: MENUS, tareas: TAREAS, proveedores: PROVEEDORES, invitados: INVITADOS,
        equiposInvitados: [...new Set(INVITADOS.map((i) => i.equipo))],
        sugerencias: db.personas.slice(0, 160).map((p) => ({ nombre: `${p.nombre} ${p.apellido.split(" ")[0]}`, equipo: db.equipos.find((e) => e.miembros.includes(p.id))?.nombre })), pagos: PAGOS, gastos: GASTOS_RETIRO, tasa: TASA_BCV,
        campos: CAMPOS_FORMULARIO, formadoresFaltan: faltanPorEdicion(), cuenta: CUENTA_ALBUMES,
      }} />
    </>
  );
}

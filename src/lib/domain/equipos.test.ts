import { describe, expect, it } from "vitest";
import { contarEnRango, describirFrecuencia, edadPromedio, frecuenciaDias, sugerirEquipo } from "./equipos";
import { tasasSeguimiento, type SeguimientoPersona } from "./seguimiento";

describe("equipos", () => {
  it("calcula la frecuencia de reunión", () => {
    expect(frecuenciaDias(["2026-10-01", "2026-10-08", "2026-10-15"])).toBe(7);
    expect(frecuenciaDias(["2026-10-01"])).toBeNull();
    expect(describirFrecuencia(7)).toBe("Semanal");
    expect(describirFrecuencia(14)).toBe("Cada dos semanas");
    expect(describirFrecuencia(60)).toBe("Irregular");
  });

  it("cuenta reuniones en un rango de fechas", () => {
    expect(contarEnRango(["2026-09-30", "2026-10-01", "2026-10-31", "2026-11-01"], "2026-10-01", "2026-10-31")).toBe(2);
  });

  it("promedia edades", () => {
    expect(edadPromedio([20, 22, 25])).toBe(22);
    expect(edadPromedio([])).toBeNull();
  });

  const eqs = [
    { id: "a", edadPromedio: 19, integrantes: 8, nombresIntegrantes: ["Ana Pérez"] },
    { id: "b", edadPromedio: 25, integrantes: 6, nombresIntegrantes: ["José Gómez"] },
    { id: "c", edadPromedio: 24, integrantes: 12, nombresIntegrantes: ["Luis Díaz"] },
  ];

  it("sugiere el equipo donde ya tiene conocidos, sin importar tildes", () => {
    expect(sugerirEquipo({ edad: 19, conocidos: ["Jose"] }, eqs)?.id).toBe("b");
  });

  it("si no hay conocidos, sugiere la edad más cercana y salta los equipos llenos", () => {
    expect(sugerirEquipo({ edad: 24, conocidos: [] }, eqs)?.id).toBe("b");
    expect(sugerirEquipo({ edad: 18, conocidos: ["Luis"] }, eqs)?.id).toBe("a");
  });
});

describe("tasas de seguimiento", () => {
  const segs: SeguimientoPersona[] = [
    { personaId: "1", actividadId: "r", pasos: { grupo: "enviado", ofrecer_de: "respondio" }, aceptoDE: true },
    { personaId: "2", actividadId: "r", pasos: { grupo: "enviado", ofrecer_de: "respondio" }, aceptoDE: false, aceptoEquipo: false },
    { personaId: "3", actividadId: "r", pasos: { grupo: "enviado", ofrecer_de: "enviado" } },
    { personaId: "4", actividadId: "r", pasos: { grupo: "enviado" } },
  ];
  const t = tasasSeguimiento(segs, "2026-10-25", new Date("2026-10-28T09:00:00"));

  it("calcula respuesta y rechazo", () => {
    expect(t.tasaRespuesta).toBe(50);
    expect(t.tasaRechazo).toBe(25);
    expect(t.aceptaronDE).toBe(1);
  });

  it("cuenta enviados y faltantes por paso, solo para los pasos que ya llegaron", () => {
    const de = t.pasos.find((p) => p.clave === "ofrecer_de")!;
    expect(de).toMatchObject({ enviados: 3, respondieron: 2, faltan: 1, llego: true });
    const equipo = t.pasos.find((p) => p.clave === "ofrecer_equipo")!;
    expect(equipo).toMatchObject({ llego: false, faltan: 0 });
  });
});

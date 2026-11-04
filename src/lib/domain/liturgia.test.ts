import { describe, expect, it } from "vitest";
import { diaLiturgico, fraseDelDia, pascua, primerDomingoAdviento, proximaCelebracion } from "./liturgia";
import { choquesConCulto, cultosDelDia, esPrimerJueves } from "./culto";
import { diasParaCumpleanos, edad, iso } from "./fechas";

describe("calendario litúrgico", () => {
  it("calcula la Pascua y el Adviento", () => {
    expect(iso(pascua(2026))).toBe("2026-04-05");
    expect(iso(pascua(2027))).toBe("2027-03-28");
    expect(iso(primerDomingoAdviento(2026))).toBe("2026-11-29");
  });
  it("reconoce solemnidades, domingos y patronos RC", () => {
    expect(diaLiturgico("2026-11-01")).toMatchObject({ nombre: "Todos los Santos", rango: "solemnidad", color: "blanco" });
    expect(diaLiturgico("2026-11-08")).toMatchObject({ nombre: "Domingo XXXII del Tiempo Ordinario", color: "verde" });
    expect(diaLiturgico("2026-11-22")).toMatchObject({ nombre: "Jesucristo, Rey del Universo", rc: true });
    expect(diaLiturgico("2026-12-13")).toMatchObject({ tiempo: "Adviento", semana: 3, color: "rosa" });
    expect(diaLiturgico("2026-01-14")).toMatchObject({ nombre: "Divina Pastora", rc: true });
  });
  it("busca la próxima celebración", () => {
    expect(proximaCelebracion("2026-11-04")?.fecha).toBe("2026-11-22");
  });
  it("da la misma frase a todos el mismo día", () => {
    expect(fraseDelDia("2026-11-04")).toEqual(fraseDelDia("2026-11-04T20:00:00"));
  });
});

describe("misas y adoración en la casa", () => {
  it("sigue el horario semanal", () => {
    expect(cultosDelDia("2026-11-02").map((c) => c.tipo)).toEqual(["Adoración", "Eucaristía"]);
    expect(cultosDelDia("2026-11-06").map((c) => c.inicio)).toEqual(["12:15"]);
    expect(cultosDelDia("2026-11-08")).toEqual([]);
  });
  it("el primer jueves cambia la hora eucarística de la casa por la de la localidad", () => {
    expect(esPrimerJueves("2026-11-05")).toBe(true);
    expect(cultosDelDia("2026-11-05").map((c) => c.tipo)).toEqual(["Eucaristía", "Hora eucarística de la localidad"]);
    expect(cultosDelDia("2026-11-12").map((c) => c.tipo)).toEqual(["Eucaristía", "Hora eucarística"]);
  });
  it("bloquea la capilla durante la misa", () => {
    expect(choquesConCulto({ espacioId: "cap", inicio: "2026-11-02T18:45:00", minutos: 90 })).toHaveLength(1);
    expect(choquesConCulto({ espacioId: "cap", inicio: "2026-11-02T10:00:00", minutos: 90 })).toHaveLength(0);
    expect(choquesConCulto({ espacioId: "s1", inicio: "2026-11-02T18:45:00", minutos: 90 })).toHaveLength(0);
  });
});

describe("edad y cumpleaños", () => {
  it("calcula la edad desde la fecha de nacimiento", () => {
    expect(edad("2000-11-02", "2026-11-01")).toBe(25);
    expect(edad("2000-11-01", "2026-11-01")).toBe(26);
  });
  it("cuenta los días al próximo cumpleaños", () => {
    expect(diasParaCumpleanos("1999-11-03", "2026-11-01")).toBe(2);
    expect(diasParaCumpleanos("1999-10-31", "2026-11-01")).toBe(364);
    expect(diasParaCumpleanos("2004-02-29", "2027-02-01")).toBe(27);
  });
});

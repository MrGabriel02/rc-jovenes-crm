import { describe, expect, it } from "vitest";
import { pasosPendientes, calendarioPasos, pasoActual, enlaceWhatsApp } from "./seguimiento";
import { faltasSeguidas, nivelAlertaFaltas, porcentajeAsistencia } from "./asistencia";
import { nivelAlertaDE, estadoEfectivo, cobertura, porConfirmar } from "./direccion";
import { resultado, deudaInscripcion, saldoPorCustodio } from "./economia";
import { compararPersonas, normalizarTelefono } from "./duplicados";
import { listaDeCompras } from "./menu";
import { fueraDeHorario, porcentajeSD } from "../data/camaras";
import { integrantesDe } from "../data/apostolados";
import { precioReserva, seSolapan, estadoReserva, cobroCafetin } from "./reservas";
import { evaluarFormador } from "./formadores";
import { mesesEntre } from "./fechas";
import type { Encuentro, MovimientoEconomico, Reserva, SesionDE } from "./types";

describe("seguimiento post retiro", () => {
  const fin = "2026-10-26"; // domingo
  it("calcula las fechas de cada paso desde el domingo de cierre", () => {
    const c = calendarioPasos(fin);
    expect(c.map((p) => p.fecha)).toEqual(["2026-10-26", "2026-10-28", "2026-10-30", "2026-11-02", "2026-11-07", "2026-11-10"]);
  });
  it("lista lo que toca hoy y lo atrasado", () => {
    const p = pasosPendientes({ personaId: "p", actividadId: "a", pasos: { grupo: "enviado" } }, fin, new Date("2026-10-30T10:00:00"));
    expect(p.map((x) => x.clave)).toEqual(["ofrecer_de", "ofrecer_equipo"]);
    expect(p[0].atrasoDias).toBe(2);
  });
  it("omite el mensaje de continuidad si la persona respondió algo", () => {
    const pasos = { grupo: "enviado", ofrecer_de: "respondio", ofrecer_equipo: "enviado", misa: "enviado", rc_news: "enviado" } as const;
    expect(pasosPendientes({ personaId: "p", actividadId: "a", pasos }, fin, new Date("2026-11-12"))).toEqual([]);
    const sinRespuesta = { ...pasos, ofrecer_de: "enviado" } as const;
    expect(pasosPendientes({ personaId: "p", actividadId: "a", pasos: sinRespuesta }, fin, new Date("2026-11-12")).map((x) => x.clave)).toEqual(["continuidad"]);
  });
  it("indica el paso actual", () => {
    expect(pasoActual(fin, new Date("2026-11-03"))?.clave).toBe("misa");
    expect(pasoActual(fin, new Date("2026-10-25"))).toBeNull();
  });
  it("arma el enlace de WhatsApp con número venezolano", () => {
    expect(enlaceWhatsApp("0412-1234567", "hola")).toBe("https://wa.me/584121234567?text=hola");
  });
});

describe("asistencia a encuentros", () => {
  const e = (fecha: string, asistentes: string[]): Encuentro => ({ id: fecha, equipoId: "t", fecha, programado: true, asistentes });
  const encuentros = [e("2026-10-01", ["a", "b"]), e("2026-10-08", ["b"]), e("2026-10-15", ["b"]), e("2026-10-22", []), e("2026-10-29", ["b"])];
  it("cuenta solo las faltas consecutivas más recientes", () => {
    expect(faltasSeguidas("a", encuentros)).toBe(4);
    expect(faltasSeguidas("b", encuentros)).toBe(0);
  });
  it("2 faltas avisan al responsable y 4 a crecimiento", () => {
    expect(nivelAlertaFaltas(1)).toBeNull();
    expect(nivelAlertaFaltas(2)).toBe("responsable");
    expect(nivelAlertaFaltas(4)).toBe("crecimiento");
  });
  it("calcula el porcentaje de asistencia", () => {
    expect(porcentajeAsistencia(["a", "b"], encuentros)).toBe(50);
  });
});

describe("dirección espiritual", () => {
  const s = (id: string, inicio: string, estado: SesionDE["estado"]): SesionDE => ({ id, personaId: "p", directorId: "d", inicio, estado, origen: "agenda_citas" });
  const hoy = new Date("2026-11-01T09:00:00");
  it("2 meses sin DE avisan al director y 3 a crecimiento", () => {
    expect(nivelAlertaDE("p", [s("1", "2026-09-15T17:00:00", "realizada")], hoy)).toBeNull();
    expect(nivelAlertaDE("p", [s("1", "2026-08-20T17:00:00", "realizada")], hoy)).toBe("director");
    expect(nivelAlertaDE("p", [s("1", "2026-07-28T17:00:00", "realizada")], hoy)).toBe("crecimiento");
  });
  it("una cita agendada que no se realizó no reinicia el contador", () => {
    const sesiones = [s("1", "2026-07-28T17:00:00", "realizada"), s("2", "2026-10-20T17:00:00", "no_realizada")];
    expect(nivelAlertaDE("p", sesiones, hoy)).toBe("crecimiento");
  });
  it("pasa a sin confirmar después de 48 h", () => {
    expect(estadoEfectivo(s("1", "2026-10-31T17:00:00", "agendada"), hoy)).toBe("agendada");
    expect(estadoEfectivo(s("1", "2026-10-28T17:00:00", "agendada"), hoy)).toBe("sin_confirmar");
    expect(porConfirmar([s("1", "2026-10-31T17:00:00", "agendada"), s("2", "2026-11-03T17:00:00", "agendada")], hoy)).toHaveLength(1);
  });
  it("calcula la cobertura de los últimos 60 días", () => {
    const sesiones = [s("1", "2026-10-10T17:00:00", "realizada")];
    expect(cobertura(["p", "q"], sesiones, hoy)).toBe(50);
  });
  it("cuenta meses calendario", () => {
    expect(mesesEntre("2026-08-31", "2026-10-30")).toBe(1);
    expect(mesesEntre("2026-08-01", "2026-11-01")).toBe(3);
  });
});

describe("economía", () => {
  const m = (tipo: "ingreso" | "gasto", monto: number, moneda: "VES" | "USD", tasa = 100, custodio = "Banco"): MovimientoEconomico => ({
    id: Math.random().toString(), fecha: "2026-07-05", tipo, categoria: "x", descripcion: "", monto, moneda, tasaBCV: tasa, metodo: "transferencia", custodio, areaId: "triduo", actividadId: null,
  });
  it("aplica el 10 % sobre la ganancia, no sobre los ingresos", () => {
    const r = resultado([m("ingreso", 100_000, "VES"), m("ingreso", 120, "USD"), m("gasto", 60_000, "VES")]);
    expect(r).toEqual({ ingresosUSD: 1120, gastosUSD: 600, ganancia: 520, aporteLocalidad: 52, saldoArea: 468 });
  });
  it("no hay aporte si hubo pérdida", () => {
    expect(resultado([m("ingreso", 10, "USD"), m("gasto", 30, "USD")]).aporteLocalidad).toBe(0);
  });
  it("calcula la deuda después de abonos mixtos", () => {
    expect(deudaInscripcion(40, [{ monto: 10, moneda: "USD" }, { monto: 1000, moneda: "VES" }], 100)).toBe(20);
  });
  it("lleva saldo por custodio", () => {
    expect(saldoPorCustodio([m("ingreso", 50, "USD", 100, "Efectivo"), m("gasto", 20, "USD", 100, "Efectivo")])).toEqual([{ custodio: "Efectivo", usd: 30 }]);
  });
});

describe("duplicados", () => {
  it("une por cédula aunque el nombre cambie", () => {
    expect(compararPersonas({ cedula: "V-12.345.678", nombreCompleto: "José A. Pérez" }, { cedula: "12345678", nombreCompleto: "Jose Perez" })).toBe("misma");
  });
  it("cédulas distintas nunca se unen", () => {
    expect(compararPersonas({ cedula: "1234567", nombreCompleto: "Ana Gil" }, { cedula: "7654321", nombreCompleto: "Ana Gil" })).toBe("distinta");
  });
  it("sin cédula, une por teléfono y nombre parecido", () => {
    expect(compararPersonas({ nombreCompleto: "María José Rojas", telefono: "0414-555.12.34" }, { nombreCompleto: "Maria Rojas", telefono: "+58 414 5551234" })).toBe("misma");
  });
  it("mismo nombre sin otro dato va a revisión", () => {
    expect(compararPersonas({ nombreCompleto: "Luis Mendoza" }, { nombreCompleto: "luis mendoza" })).toBe("probable");
  });
  it("normaliza teléfonos", () => {
    expect(normalizarTelefono("4121234567")).toBe("584121234567");
    expect(normalizarTelefono("123")).toBeNull();
  });
});

describe("menú de retiros", () => {
  it("escala por asistentes, suma repetidos y descuenta lo disponible", () => {
    const menu = [
      { dia: "Sábado", momento: "Desayuno", plato: "Arepas", ingredientes: [{ ingrediente: "Harina de maíz", unidad: "kg", porPersona: 0.15 }, { ingrediente: "Queso", unidad: "kg", porPersona: 0.05 }] },
      { dia: "Domingo", momento: "Desayuno", plato: "Arepas", ingredientes: [{ ingrediente: "Harina de maíz", unidad: "kg", porPersona: 0.15 }] },
    ];
    const l = listaDeCompras(menu, 51, { "Harina de maíz": 5 });
    expect(l).toEqual([
      { ingrediente: "Harina de maíz", unidad: "kg", necesario: 15.3, disponible: 5, faltante: 10.3 },
      { ingrediente: "Queso", unidad: "kg", necesario: 2.6, disponible: 0, faltante: 2.6 },
    ]);
  });
});

describe("reservas", () => {
  const r = (id: string, inicio: string, bloques = 1, espacioId = "s1"): Reserva => ({ id, espacioId, inicio, bloques, solicitante: "x", tipoSolicitante: "externo", responsable: "x", telefono: "", motivo: "", aprobaciones: [] });
  it("cobra por bloque y no cobra a apostolados", () => {
    expect(precioReserva("auditorio", 2, "externo")).toBe(50);
    expect(precioReserva("auditorio", 2, "otra_seccion")).toBe(50);
    expect(precioReserva("auditorio", 2, "apostolado")).toBe(0);
  });
  it("detecta solapamientos en el mismo espacio", () => {
    expect(seSolapan(r("a", "2026-11-05T18:00:00"), r("b", "2026-11-05T19:00:00"))).toBe(true);
    expect(seSolapan(r("a", "2026-11-05T18:00:00"), r("b", "2026-11-05T19:30:00"))).toBe(false);
    expect(seSolapan(r("a", "2026-11-05T18:00:00"), r("b", "2026-11-05T18:00:00", 1, "s2"))).toBe(false);
  });
  it("requiere la aprobación de los dos directores", () => {
    const x = { ...r("a", "2026-11-05T18:00:00"), aprobaciones: ["d1"] };
    expect(estadoReserva(x, ["d1", "d2"])).toBe("pendiente");
    expect(estadoReserva({ ...x, aprobaciones: ["d1", "d2"] }, ["d1", "d2"])).toBe("aprobada");
  });
});

describe("formadores", () => {
  it("propone destitución si no asistió a ninguna obligatoria del año", () => {
    const todas = ["retiro_anual", "vfc", "fin_semana_formadores"] as const;
    expect(evaluarFormador({}, [...todas]).proponerDestitucion).toBe(true);
    expect(evaluarFormador({ vfc: true }, [...todas])).toEqual({ faltas: ["retiro_anual", "fin_semana_formadores"], proponerDestitucion: false });
  });
});

describe("cafetín", () => {
  it("cobra el 10 % de cada venta más USD 300 de alquiler", () => {
    expect(cobroCafetin([100, 50.5])).toEqual({ totalVentas: 150.5, porcentaje: 15.05, alquiler: 300, total: 315.05 });
    expect(cobroCafetin([]).total).toBe(300);
  });
});

describe("cámaras", () => {
  it("marca el movimiento fuera del horario de la casa", () => {
    expect(fueraDeHorario("2026-10-31T21:14:00")).toBe(true);
    expect(fueraDeHorario("2026-10-31T06:59:00")).toBe(true);
    expect(fueraDeHorario("2026-11-01T08:52:00")).toBe(false);
  });
  it("calcula el uso de la microSD", () => {
    expect(porcentajeSD({ sdUsadaGB: 60, sdTotalGB: 64 })).toBe(94);
    expect(porcentajeSD({ sdUsadaGB: 0, sdTotalGB: 0 })).toBe(0);
  });
});

describe("apostolados", () => {
  it("lista director y ecónomo como integrantes activos y separa a quienes ya pasaron", () => {
    const lista = integrantesDe("search");
    expect(lista[0].cargo).toBe("Director del apostolado");
    expect(lista.some((x) => x.cargo === "Ecónomo")).toBe(true);
    expect(lista.filter((x) => x.hasta).length).toBeGreaterThan(0);
    expect(new Set(lista.map((x) => x.personaId)).size).toBe(lista.length);
  });
});

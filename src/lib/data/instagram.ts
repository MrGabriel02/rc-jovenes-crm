// Métricas SIMULADAS. En producción se capturan cada día desde la Instagram Graph API.
const meses = ["may", "jun", "jul", "ago", "sep", "oct"];
export const INSTAGRAM = {
  seccion: {
    usuario: "@[cuenta de la sección]",
    mensual: meses.map((mes, i) => ({ mes, seguidores: [2140, 2210, 2390, 2430, 2510, 2680][i], alcance: [8100, 7600, 15400, 6900, 9800, 13200][i], interacciones: [640, 590, 1450, 520, 810, 1190][i] })),
  },
  director: {
    usuario: "@[cuenta del director]",
    mensual: meses.map((mes, i) => ({ mes, seguidores: [1310, 1340, 1395, 1420, 1460, 1502][i], alcance: [3900, 4100, 6800, 3500, 4700, 5900][i], interacciones: [310, 335, 590, 280, 402, 455][i] })),
  },
  publicaciones: [
    { titulo: "Reel: testimonio God's Plan 23", tipo: "Reel", alcance: 6120, interacciones: 488 },
    { titulo: "Carrusel: inscripciones Search XXV", tipo: "Carrusel", alcance: 4210, interacciones: 301 },
    { titulo: "Historia: hora eucarística", tipo: "Historia", alcance: 1830, interacciones: 77 },
    { titulo: "Foto: Misiones de Adviento", tipo: "Foto", alcance: 2950, interacciones: 214 },
  ],
};

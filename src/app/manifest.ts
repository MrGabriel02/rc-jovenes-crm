import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RC Jóvenes Barquisimeto",
    short_name: "RC Jóvenes",
    description: "Seguimiento, equipos, dirección espiritual, economía y casa de la sección de Jóvenes",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3f1",
    theme_color: "#8a1b24",
    lang: "es",
    icons: [
      { src: "/marca/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/marca/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RC Jóvenes Barquisimeto",
    short_name: "RC Jóvenes",
    description: "Seguimiento, equipos, dirección espiritual, economía y casa de la sección de Jóvenes",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5f8",
    theme_color: "#0f1b2d",
    lang: "es",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

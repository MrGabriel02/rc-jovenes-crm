import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "RC Jóvenes", template: "%s · RC Jóvenes" },
  description: "Plataforma de gestión de la sección de Jóvenes de Regnum Christi Barquisimeto",
  appleWebApp: { capable: true, title: "RC Jóvenes", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#0f1b2d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

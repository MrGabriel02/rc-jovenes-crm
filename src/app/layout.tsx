import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { BotonTema, SCRIPT_PREFERENCIAS } from "@/components/preferencias";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "RC Jóvenes", template: "%s · RC Jóvenes" },
  description: "Plataforma de gestión de la sección de Jóvenes de Regnum Christi Barquisimeto",
  appleWebApp: { capable: true, title: "RC Jóvenes", statusBarStyle: "default" },
  icons: { icon: "/marca/icon-192.png", apple: "/marca/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#8a1b24" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCIAS }} />
      </head>
      <body className="min-h-full font-sans">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:pb-8 lg:pt-4">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              <div className="-mb-3 hidden justify-end lg:flex">
                <BotonTema className="border border-border bg-surface text-ink shadow-sm hover:border-brand" />
              </div>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

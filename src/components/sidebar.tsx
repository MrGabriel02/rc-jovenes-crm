"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { MODULOS } from "./nav";
import { BotonMenu, BotonTema } from "./preferencias";

export function Sidebar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const activo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav aria-label="Módulos" className="bg-nav bg-[linear-gradient(180deg,var(--nav-2),var(--nav))] text-nav-ink transition-[width] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto plegado:lg:w-[76px]">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-6 plegado:lg:justify-center plegado:lg:px-0">
        <Link href="/" className="flex items-center gap-3 text-white no-underline" title="RC Jóvenes Barquisimeto">
          <Image src="/marca/rc-escudo.png" alt="" width={44} height={44} priority className="size-11 shrink-0 rounded-full ring-2 ring-white/15" />
          <span className="flex flex-col leading-tight plegado:lg:hidden">
            <span className="text-[15px] font-bold">RC Jóvenes</span>
            <span className="text-xs text-nav-ink">Barquisimeto</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 lg:hidden">
          <BotonTema className="text-white hover:bg-white/10" />
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-white"
            aria-expanded={abierto}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <ul className={clsx("flex-col gap-0.5 px-3 pb-4 lg:flex lg:flex-1 plegado:lg:px-2", abierto ? "flex" : "hidden")}>
        {MODULOS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setAbierto(false)}
              aria-current={activo(href) ? "page" : undefined}
              title={label}
              className={clsx(
                "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm no-underline transition-colors plegado:lg:justify-center plegado:lg:px-0",
                activo(href) ? "bg-brand font-bold text-white" : "font-medium hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon size={18} aria-hidden className="shrink-0" />
              <span className="plegado:lg:sr-only">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden px-3 pb-6 lg:block plegado:lg:px-2"><BotonMenu /></div>
    </nav>
  );
}

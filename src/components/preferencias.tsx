"use client";

import { useEffect, useState } from "react";
import { Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import clsx from "clsx";

/** Se ejecuta antes de pintar: aplica el tema y el menú guardados para evitar parpadeos. */
export const SCRIPT_PREFERENCIAS = `try{var t=localStorage.getItem("rc-tema");if(t)document.documentElement.dataset.theme=t;if(localStorage.getItem("rc-menu")==="plegado")document.documentElement.dataset.menu="plegado"}catch(e){}`;

function guardar(clave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch {}
}

export function BotonTema({ className }: { className?: string }) {
  const [oscuro, setOscuro] = useState<boolean | null>(null);
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se lee el tema real del navegador al montar
    setOscuro(t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  const cambiar = () => {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    document.documentElement.dataset.theme = nuevo ? "dark" : "light";
    guardar("rc-tema", nuevo ? "dark" : "light");
  };
  return (
    <button type="button" onClick={cambiar} aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} title={oscuro ? "Modo claro" : "Modo oscuro"}
      className={clsx("flex size-11 items-center justify-center rounded-full transition-colors", className)}>
      {oscuro ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
    </button>
  );
}

export function BotonMenu() {
  const [plegado, setPlegado] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- estado guardado en <html>
    setPlegado(document.documentElement.dataset.menu === "plegado");
  }, []);
  const cambiar = () => {
    const nuevo = !plegado;
    setPlegado(nuevo);
    if (nuevo) document.documentElement.dataset.menu = "plegado";
    else delete document.documentElement.dataset.menu;
    guardar("rc-menu", nuevo ? "plegado" : null);
  };
  return (
    <button type="button" onClick={cambiar} aria-expanded={!plegado} aria-label={plegado ? "Mostrar el menú completo" : "Plegar el menú"} title={plegado ? "Mostrar menú" : "Plegar menú"}
      className="hidden min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-nav-ink hover:bg-white/10 hover:text-white lg:flex plegado:lg:justify-center plegado:lg:px-0">
      {plegado ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
      <span className="plegado:lg:sr-only">Plegar menú</span>
    </button>
  );
}

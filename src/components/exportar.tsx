"use client";

import { useState } from "react";
import { Copy, FileDown } from "lucide-react";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Descarga un texto como documento de Word (.doc) con títulos y viñetas simples. */
export function descargarDoc(nombre: string, texto: string) {
  const cuerpo = texto.split("\n").map((l, i) => {
    if (i === 0) return `<h1>${esc(l)}</h1>`;
    if (l.startsWith("- ")) return `<li>${esc(l.slice(2))}</li>`;
    if (!l.trim()) return "";
    return `<h3>${esc(l)}</h3>`;
  }).join("\n").replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  const html = `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial,sans-serif}h1{color:#8a1b24}</style></head><body>${cuerpo}</body></html>`;
  const url = URL.createObjectURL(new Blob(["﻿", html], { type: "application/msword" }));
  const a = document.createElement("a");
  a.href = url; a.download = `${nombre}.doc`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BotonesExportar({ nombre, texto }: { nombre: string; texto: () => string }) {
  const [copiado, setCopiado] = useState(false);
  const clase = "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:border-brand";
  return (
    <span className="flex flex-wrap gap-2">
      <button type="button" className={clase} onClick={() => descargarDoc(nombre, texto())}><FileDown size={16} aria-hidden />Exportar .doc</button>
      <button type="button" className={clase} onClick={async () => { try { await navigator.clipboard.writeText(texto()); setCopiado(true); setTimeout(() => setCopiado(false), 2000); } catch { /* sin permiso de portapapeles */ } }}>
        <Copy size={16} aria-hidden />{copiado ? "Copiado" : "Copiar texto"}
      </button>
    </span>
  );
}

"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";

/** Pestañas accesibles (role=tablist) con paneles ya renderizados en el servidor. */
export function Tabs({ tabs, inicial = 0 }: { tabs: { label: string; content: ReactNode; badge?: ReactNode }[]; inicial?: number }) {
  const [sel, setSel] = useState(inicial);
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            type="button"
            id={`${id}-t${i}`}
            aria-selected={sel === i}
            aria-controls={`${id}-p${i}`}
            onClick={() => setSel(i)}
            className={clsx(
              "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
              sel === i ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
            {t.badge}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`} hidden={sel !== i} className="flex flex-col gap-4">
          {t.content}
        </div>
      ))}
    </div>
  );
}

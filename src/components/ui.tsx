import clsx from "clsx";
import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[28px]">{title}</h1>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({ title, subtitle, action, children, className }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5", className)}>
      {title ? (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-extrabold">{title}</h2>
            {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Kpi({ label, value, note, tone = "neutral" }: { label: string; value: ReactNode; note?: string; tone?: "neutral" | "good" | "warn" }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-5">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      <span className="text-3xl font-extrabold tracking-tight">{value}</span>
      {note ? <span className={clsx("text-xs", tone === "good" ? "text-good-ink" : tone === "warn" ? "text-warn-ink" : "text-muted")}>{note}</span> : null}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warn" | "good" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold",
        tone === "accent" && "bg-accent-soft text-accent",
        tone === "warn" && "bg-warn-bg text-warn-ink",
        tone === "good" && "bg-good-bg text-good-ink",
        tone === "neutral" && "bg-surface-2 text-ink-2",
      )}
    >
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors disabled:opacity-50",
        variant === "primary" ? "bg-[#1e3a8a] text-white hover:bg-[#172554]" : "border border-border bg-surface text-ink hover:bg-surface-2",
        rest.className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "primary", external }: { href: string; children: ReactNode; variant?: "primary" | "secondary"; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold no-underline",
        variant === "primary" ? "bg-[#1e3a8a] text-white hover:bg-[#172554]" : "border border-border bg-surface text-ink hover:bg-surface-2",
      )}
    >
      {children}
    </a>
  );
}

export function Alerta({ tipo, titulo, detalle, tone = "warn" }: { tipo: string; titulo: ReactNode; detalle?: ReactNode; tone?: "warn" | "info" }) {
  return (
    <div className={clsx("flex items-start gap-3 rounded-xl border p-3", tone === "warn" ? "border-warn-border bg-warn-bg" : "border-info-border bg-info-bg")}>
      <span className={clsx("min-w-20 pt-0.5 text-[11px] font-extrabold uppercase tracking-wide", tone === "warn" ? "text-warn-ink" : "text-accent")}>{tipo}</span>
      <div className="flex flex-col gap-0.5">
        <strong className="text-sm">{titulo}</strong>
        {detalle ? <span className="text-xs text-ink-2">{detalle}</span> : null}
      </div>
    </div>
  );
}

export function Table({ head, children, minWidth = 560 }: { head: ReactNode[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="text-left text-muted">
            {head.map((h, i) => (
              <th key={i} className="px-2 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t [&>tr]:border-border [&_td]:px-2 [&_td]:py-2.5">{children}</tbody>
      </table>
    </div>
  );
}

export function AvisoSimulado() {
  return (
    <p className="self-start rounded-lg border border-warn-border bg-warn-bg px-3 py-2 text-xs text-warn-ink">
      Versión de demostración con datos simulados: ningún nombre ni número corresponde a personas reales.
    </p>
  );
}

export function Grid({ children, min = 320 }: { children: ReactNode; min?: number }) {
  return <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>;
}

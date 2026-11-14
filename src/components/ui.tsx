import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

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

export function Card({ title, subtitle, action, children, className, id }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={clsx("flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-surface p-5", className)}>
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

export function Sparkline({ data, label }: { data: number[]; label: string }) {
  if (data.length < 2) return null;
  const w = 96, h = 32, min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / r) * (h - 6)]);
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} className="shrink-0 overflow-visible">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={4} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
    </svg>
  );
}

export function Kpi({ label, value, note, tone = "neutral", icon, trend, delta }: {
  label: string; value: ReactNode; note?: string; tone?: "neutral" | "good" | "warn";
  icon?: ReactNode; trend?: number[]; delta?: { valor: string; sube: boolean; bueno: boolean } | null;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-2">
        {icon ? <span aria-hidden className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">{icon}</span> : null}
        <span className="text-[13px] font-semibold text-muted">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-3xl font-extrabold tracking-tight tabular-nums">{value}</span>
        {trend ? <Sparkline data={trend} label={`Tendencia de ${label}`} /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta ? <span className={clsx("font-bold", delta.bueno ? "text-good-ink" : "text-warn-ink")}>{delta.sube ? "▲" : "▼"} {delta.valor}</span> : null}
        {note ? <span className={clsx(tone === "good" ? "text-good-ink" : tone === "warn" ? "text-warn-ink" : "text-muted")}>{note}</span> : null}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warn" | "good" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-bold",
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
        variant === "primary" ? "bg-brand text-white hover:bg-brand-hover" : "border border-border bg-surface text-ink hover:bg-surface-2",
        rest.className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "primary", external }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "light"; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold no-underline",
        variant === "primary" && "bg-brand text-white hover:bg-brand-hover",
        variant === "secondary" && "border border-border bg-surface text-ink hover:bg-surface-2",
        variant === "light" && "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25",
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
  // Fichas pequeñas (min ≤ 220): en el teléfono van de a dos por fila en vez de una debajo de otra.
  if (min <= 220) {
    return (
      <div className="grid gap-3 [--g:150px] sm:gap-4 sm:[--g:var(--g-min)]" style={{ "--g-min": `${min}px`, gridTemplateColumns: "repeat(auto-fit, minmax(min(var(--g), 100%), 1fr))" } as CSSProperties}>{children}</div>
    );
  }
  return <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>{children}</div>;
}

/** Lista de barras horizontales para respuestas de una sola pregunta (cantidad y porcentaje). */
export function BarrasLista({ datos, total }: { datos: { etiqueta: string; n: number }[]; total?: number }) {
  const t = total ?? datos.reduce((a, d) => a + d.n, 0);
  const max = Math.max(1, ...datos.map((d) => d.n));
  // Con total, cada barra es su porcentaje del total; sin él, se compara con la mayor.
  return (
    <ul className="flex flex-col gap-2.5">
      {datos.map((d) => (
        <li key={d.etiqueta} className="flex flex-col gap-1">
          <span className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-ink-2">{d.etiqueta}</span>
            <span className="tabular-nums"><strong>{d.n}</strong> <span className="text-xs text-muted">{t ? Math.round((d.n / t) * 100) : 0} %</span></span>
          </span>
          <span className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <span className="block h-full rounded-full bg-[var(--series-1)]" style={{ width: `${(d.n / (total ?? max)) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

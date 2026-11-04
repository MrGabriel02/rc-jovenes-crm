"use client";

import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const eje = { fontSize: 12, fill: "var(--muted)" };
const grid = <CartesianGrid stroke="var(--border)" vertical={false} />;
const tooltipStyle = {
  contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--ink)" },
  cursor: { fill: "var(--surface-2)" },
};

type Row = Record<string, string | number>;

export function Columnas({ data, x, y, nombre, sufijo = "", alto = 220, color = "var(--series-1)" }: { data: Row[]; x: string; y: string; nombre: string; sufijo?: string; alto?: number; color?: string }) {
  return (
    <div style={{ height: alto }} role="img" aria-label={nombre}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
          {grid}
          <XAxis dataKey={x} tick={eje} axisLine={false} tickLine={false} />
          <YAxis tick={eje} axisLine={false} tickLine={false} unit={sufijo} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${sufijo}`, nombre]} />
          <Bar dataKey={y} name={nombre} fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IngresosGastos({ data, alto = 240 }: { data: Row[]; alto?: number }) {
  return (
    <div style={{ height: alto }} role="img" aria-label="Ingresos y gastos por mes en dólares">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
          {grid}
          <XAxis dataKey="mes" tick={eje} axisLine={false} tickLine={false} />
          <YAxis tick={eje} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v.toLocaleString("es-VE")}`} width={64} />
          <Tooltip {...tooltipStyle} formatter={(v, n) => [`$${Number(v).toLocaleString("es-VE")}`, n]} />
          <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span style={{ color: "var(--ink-2)" }}>{v}</span>} />
          <Bar dataKey="ingresos" name="Ingresos" fill="var(--series-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="gastos" name="Gastos" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarrasHorizontales({ data, x, y, nombre, sufijo = "", color = "var(--accent)" }: { data: Row[]; x: string; y: string; nombre: string; sufijo?: string; color?: string }) {
  const alto = Math.max(160, data.length * 34 + 24);
  return (
    <div style={{ height: alto }} role="img" aria-label={nombre}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey={x} tick={eje} axisLine={false} tickLine={false} width={150} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${sufijo}`, nombre]} />
          <Bar dataKey={y} name={nombre} fill={color} radius={[0, 4, 4, 0]} maxBarSize={14} label={{ position: "right", fontSize: 12, fill: "var(--ink-2)", formatter: (v: unknown) => `${v}${sufijo}` }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Linea({ data, x, series, sufijo = "", alto = 220 }: { data: Row[]; x: string; series: { clave: string; nombre: string; color: string }[]; sufijo?: string; alto?: number }) {
  return (
    <div style={{ height: alto }} role="img" aria-label={series.map((s) => s.nombre).join(", ")}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          {grid}
          <XAxis dataKey={x} tick={eje} axisLine={false} tickLine={false} />
          <YAxis tick={eje} axisLine={false} tickLine={false} unit={sufijo} domain={["auto", "auto"]} />
          <Tooltip {...tooltipStyle} cursor={{ stroke: "var(--border)" }} />
          {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span style={{ color: "var(--ink-2)" }}>{v}</span>} /> : null}
          {series.map((s) => (
            <Line key={s.clave} type="monotone" dataKey={s.clave} name={s.nombre} stroke={s.color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Embudo({ etapas }: { etapas: { etapa: string; n: number }[] }) {
  const max = Math.max(1, ...etapas.map((e) => e.n));
  return (
    <ol className="flex flex-col gap-3" aria-label="Embudo de seguimiento">
      {etapas.map((e, i) => (
        <li key={e.etapa} className="flex flex-col gap-1">
          <div className="flex justify-between text-[13px]">
            <span>{e.etapa}</span>
            <span className="font-bold">
              {e.n}
              {i > 0 ? <span className="ml-2 font-normal text-muted">{Math.round((e.n / etapas[0].n) * 100)} %</span> : null}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-2">
            <div className="h-2.5 rounded-full bg-accent" style={{ width: `${(e.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

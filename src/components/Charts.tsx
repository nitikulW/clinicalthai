"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Bucket } from "@/lib/stats";

const AXIS = { fontSize: 12, fill: "var(--muted)" };

function TooltipBox({ active, payload }: { active?: boolean; payload?: { payload: Bucket }[] }) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{b.label}</p>
      <p className="text-muted">{b.value.toLocaleString("th-TH")} งานวิจัย</p>
    </div>
  );
}

function ChartCard({
  title,
  sub,
  data,
  children,
}: {
  title: string;
  sub?: string;
  data: Bucket[];
  children: React.ReactNode;
}) {
  const [table, setTable] = useState(false);
  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {sub && <p className="text-sm text-muted">{sub}</p>}
        </div>
        <button onClick={() => setTable((v) => !v)} className="shrink-0 text-xs text-muted underline hover:text-ink">
          {table ? "ดูกราฟ" : "ดูตาราง"}
        </button>
      </div>
      {table ? (
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {data.map((d) => (
                <tr key={d.key}>
                  <td className="py-1.5 pr-3">{d.label}</td>
                  <td className="py-1.5 text-right tabular-nums">{d.value.toLocaleString("th-TH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/** Ranked horizontal bars; clicking a bar drills into the explorer. */
export function RankChart({
  title,
  sub,
  data,
  drill,
}: {
  title: string;
  sub?: string;
  data: Bucket[];
  /** query param name used when a bar is clicked */
  drill?: { param: string; base: string };
}) {
  const router = useRouter();
  const height = Math.max(160, data.length * 28 + 24);
  return (
    <ChartCard title={title} sub={sub} data={data}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={170}
            tick={AXIS}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: string) => (v.length > 26 ? `${v.slice(0, 25)}…` : v)}
          />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar
            dataKey="value"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            label={{ position: "right", fontSize: 12, fill: "var(--muted)" }}
            className={drill ? "cursor-pointer" : undefined}
            onClick={(entry) => {
              const key = (entry as unknown as { payload?: Bucket }).payload?.key;
              if (drill && key && key !== "?") {
                const u = new URLSearchParams(drill.base);
                u.set(drill.param, key);
                router.push(`/research/explore?${u}`);
              }
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Vertical bars for ordered categories (years, phases). */
export function ColumnChart({ title, sub, data, height = 240 }: { title: string; sub?: string; data: Bucket[]; height?: number }) {
  return (
    <ChartCard title={title} sub={sub} data={data}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Share of a whole as a single stacked strip with a legend table. */
export function ShareBar({ title, data }: { title: string; data: Bucket[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  // Fixed categorical order from the reference palette (slots 1-3), rest folded into "อื่นๆ".
  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];
  const top = data.slice(0, 3);
  const rest = data.slice(3).reduce((s, d) => s + d.value, 0);
  const parts = rest ? [...top, { key: "rest", label: "อื่นๆ", value: rest }] : top;
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 flex h-4 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={title}>
        {parts.map((p, i) => (
          <div
            key={p.key}
            title={`${p.label}: ${p.value}`}
            style={{ width: `${(p.value / total) * 100}%`, background: COLORS[i] ?? "var(--muted)" }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {parts.map((p, i) => (
          <li key={p.key} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm" style={{ background: COLORS[i] ?? "var(--muted)" }} aria-hidden />
            <span className="flex-1">{p.label}</span>
            <span className="tabular-nums text-muted">
              {p.value.toLocaleString("th-TH")} ({Math.round((p.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

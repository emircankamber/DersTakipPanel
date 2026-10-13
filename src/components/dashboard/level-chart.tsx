"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChartIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { courseColor, courseHex } from "@/lib/colors";
import type { DashboardCourse } from "@/lib/dashboard";
import { REVIEW_THRESHOLD } from "@/lib/levels";
import { cn } from "@/lib/utils";
import { Section } from "./section";
import { useChartTheme, useIsNarrow } from "./use-chart-theme";

type Row = { week: number } & Record<string, number | null>;

function ChartTooltip({
  active,
  payload,
  label,
  courses,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ dataKey?: unknown; value?: unknown }>;
  label?: unknown;
  courses: DashboardCourse[];
}) {
  if (!active || !payload?.length) return null;
  const rows = payload
    .filter((p) => typeof p.value === "number")
    .map((p) => ({ course: courses.find((c) => c.id === p.dataKey)!, value: p.value as number }))
    .filter((r) => r.course)
    .sort((a, b) => b.value - a.value);
  if (!rows.length) return null;
  return (
    <div className="min-w-44 rounded-lg border bg-popover px-3 py-2.5 text-xs shadow-xl">
      <div className="mb-1.5 font-medium">{String(label)}. hafta</div>
      <div className="grid gap-1">
        {rows.map((r) => (
          <div key={r.course.id} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: courseColor(r.course.color) }} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.course.name}</span>
            <span className={cn("tabular font-medium", r.value < REVIEW_THRESHOLD && "text-warning")}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LevelChart({ courses, maxWeeks }: { courses: DashboardCourse[]; maxWeeks: number }) {
  const theme = useChartTheme();
  const narrow = useIsNarrow();
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const [focused, setFocused] = React.useState<string | null>(null);

  const plotted = React.useMemo(() => courses.filter((c) => c.elapsed > 0), [courses]);
  const visible = plotted.filter((c) => !hidden.has(c.id));

  const data: Row[] = React.useMemo(
    () =>
      Array.from({ length: maxWeeks }, (_, i) => {
        const row: Row = { week: i + 1 } as Row;
        for (const c of plotted) row[c.id] = i < c.elapsed && i < c.weekCount ? c.levels[i] : null;
        return row;
      }),
    [plotted, maxWeeks],
  );

  const toggle = (id: string) =>
    setHidden((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <Section
      id="chart-title"
      title="Öğrenme seviyesi"
      description="Ders bazında hafta hafta, 0–100"
      className="lg:col-span-2"
    >
      {plotted.length === 0 ? (
        <div className="flex min-h-64 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
          <LineChartIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-[13px] text-muted-foreground">Dönem başlayınca haftalık seviyeler burada çizilecek.</p>
        </div>
      ) : (
        <>
          {/* Lejant — tıklayınca seriyi gizle/göster */}
          <div className="mb-4 flex flex-wrap gap-x-1 gap-y-1">
            {plotted.map((c) => {
              const off = hidden.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  onMouseEnter={() => !off && setFocused(c.id)}
                  onMouseLeave={() => setFocused(null)}
                  onFocus={() => !off && setFocused(c.id)}
                  onBlur={() => setFocused(null)}
                  aria-pressed={!off}
                  title={off ? "Göster" : "Gizle"}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent",
                    off ? "text-muted-foreground/60" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn("h-0.5 w-3 rounded-full transition-opacity", off && "opacity-30")}
                    style={{ backgroundColor: courseColor(c.color) }}
                  />
                  <span className={cn(off && "line-through")}>{c.name}</span>
                </button>
              );
            })}
          </div>

          <div className="h-64 sm:h-72" role="img" aria-label="Derslerin haftalık öğrenme seviyesi çizgi grafiği">
            {!theme.mounted ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid vertical={false} stroke={theme.grid} />
                  <XAxis
                    dataKey="week"
                    type="number"
                    domain={[1, Math.max(maxWeeks, 2)]}
                    ticks={Array.from({ length: maxWeeks }, (_, i) => i + 1).filter((w) => !narrow || w % 2 === 1)}
                    tickLine={false}
                    axisLine={{ stroke: theme.axis }}
                    tick={{ fill: theme.muted, fontSize: 11 }}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: theme.muted, fontSize: 11 }}
                    width={44}
                  />
                  <ReferenceLine
                    y={REVIEW_THRESHOLD}
                    stroke={theme.muted}
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{
                      value: "tekrar eşiği",
                      position: "insideBottomRight",
                      fill: theme.muted,
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                  <Tooltip
                    cursor={{ stroke: theme.axis, strokeWidth: 1 }}
                    content={(props) => (
                      <ChartTooltip
                        active={props.active}
                        payload={props.payload}
                        label={props.label}
                        courses={plotted}
                      />
                    )}
                    isAnimationActive={false}
                  />
                  {visible.map((c) => {
                    const stroke = courseHex(c.color, theme.dark);
                    const dim = focused !== null && focused !== c.id;
                    return (
                      <Line
                        key={c.id}
                        dataKey={c.id}
                        name={c.name}
                        type="monotone"
                        stroke={stroke}
                        strokeWidth={focused === c.id ? 2.5 : 2}
                        strokeOpacity={dim ? 0.15 : 1}
                        connectNulls={false}
                        dot={false}
                        activeDot={{ r: 4, stroke: theme.surface, strokeWidth: 2, fill: stroke }}
                        animationDuration={700}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </Section>
  );
}

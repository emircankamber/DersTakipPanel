"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { levelLabel } from "@/lib/levels";
import type { Week } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WeekStrip({
  weeks,
  levels,
  selected,
  current,
  color,
  onSelect,
}: {
  weeks: Week[];
  levels: Record<string, number>;
  selected: number;
  current: number | null;
  color: string;
  onSelect: (n: number) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-week="${selected}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  return (
    <div className="relative -mx-4 sm:mx-0">
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Haftalar"
        className="scrollbar-none flex snap-x gap-1.5 overflow-x-auto px-4 py-1 sm:px-0"
      >
        {weeks.map((w) => {
          const level = levels[w.id] ?? 0;
          const active = w.week_number === selected;
          const isCurrent = w.week_number === current;
          const future = current !== null && w.week_number > current;
          return (
            <Tooltip key={w.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-week={w.week_number}
                  onClick={() => onSelect(w.week_number)}
                  className={cn(
                    "group relative flex h-[72px] w-12 shrink-0 snap-center flex-col items-center justify-between rounded-xl border px-1 pt-3 pb-3 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:w-14",
                    active ? "border-border-strong bg-card shadow-[inset_0_1px_0_var(--highlight),0_8px_20px_-12px_var(--shadow)]" : "bg-card/50 hover:bg-card",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="week-active"
                      className="absolute inset-0 rounded-xl border border-foreground/30"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative font-display text-xl leading-none tabular",
                      active ? "text-foreground" : future ? "text-muted-foreground/60" : "text-muted-foreground",
                    )}
                  >
                    {w.week_number}
                  </span>
                  <span className="relative h-1 w-6 overflow-hidden rounded-full bg-muted">
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: color }}
                      initial={false}
                      animate={{ width: `${level}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </span>
                  {isCurrent && (
                    <span className="absolute -top-1 right-1 size-2 rounded-full border-2 border-background bg-brand" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {w.week_number}. hafta · %{level} {levelLabel(level).toLocaleLowerCase("tr-TR")}
                {isCurrent && " · bu hafta"}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

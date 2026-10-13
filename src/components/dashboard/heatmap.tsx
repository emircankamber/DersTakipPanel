"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { courseColor } from "@/lib/colors";
import type { DashboardCourse } from "@/lib/dashboard";
import { REVIEW_THRESHOLD, levelLabel } from "@/lib/levels";
import { cn } from "@/lib/utils";
import { Section } from "./section";

/** Tek tonlu sıralı ölçek: zeminden markaya. */
export function heatColor(level: number) {
  if (level <= 0) return undefined;
  return `color-mix(in oklab, var(--brand) ${Math.round(18 + level * 0.82)}%, var(--muted))`;
}

export function Heatmap({ courses, maxWeeks }: { courses: DashboardCourse[]; maxWeeks: number }) {
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);
  const cols = `minmax(88px, 168px) repeat(${maxWeeks}, minmax(24px, 1fr))`;

  return (
    <Section
      id="heatmap-title"
      title="Ders × hafta"
      description="Her hücre bir haftanın öğrenme seviyesi"
      className="lg:col-span-3"
      action={
        <div className="hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] border border-dashed border-foreground/20" />
            gelecek
          </span>
          <span className="flex items-center gap-1.5">
            0
            <span
              className="relative h-2.5 w-24 rounded-full"
              style={{ background: "linear-gradient(to right, var(--muted), var(--brand))" }}
            >
              <span
                className="absolute -top-0.5 -bottom-0.5 w-px bg-foreground/50"
                style={{ left: `${REVIEW_THRESHOLD}%` }}
                title="Tekrar eşiği"
              />
            </span>
            100
          </span>
        </div>
      }
    >
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[520px] gap-1" style={{ gridTemplateColumns: cols }} role="grid" aria-label="Ders ve hafta ısı haritası">
          <div />
          {weeks.map((w) => (
            <div key={w} className="pb-1 text-center text-[10px] text-muted-foreground tabular" role="columnheader">
              {w}
            </div>
          ))}

          {courses.map((c, ci) => (
            <div key={c.id} className="contents" role="row">
              <Link
                href={`/dersler/${c.id}`}
                className="sticky left-0 z-10 flex min-w-0 items-center gap-2 bg-card pr-3 text-xs hover:text-foreground"
                role="rowheader"
              >
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: courseColor(c.color) }} />
                <span className="truncate text-muted-foreground">{c.name}</span>
              </Link>
              {weeks.map((w) => {
                if (w > c.weekCount) return <div key={w} role="gridcell" />;
                const level = c.levels[w - 1];
                const past = w <= c.elapsed;
                const current = c.info.status === "active" && c.info.week === w;
                return (
                  <Tooltip key={w}>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/dersler/${c.id}?hafta=${w}`}
                        role="gridcell"
                        aria-label={`${c.name}, ${w}. hafta, seviye ${level}`}
                        className="block outline-none"
                      >
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, delay: ci * 0.04 + w * 0.012 }}
                          className={cn(
                            "block h-7 w-full rounded-[4px] transition-[transform,box-shadow] hover:scale-105 sm:h-8",
                            past ? "bg-muted" : "border border-dashed border-foreground/15",
                            current && "ring-1 ring-foreground/60 ring-offset-1 ring-offset-card",
                          )}
                          style={past ? { backgroundColor: heatColor(level) } : undefined}
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="font-medium">{c.name}</span> · {w}. hafta
                      <br />
                      <span className="text-muted-foreground">
                        {past ? (
                          <>
                            Seviye {level} · {levelLabel(level).toLocaleLowerCase("tr-TR")}
                            {level < REVIEW_THRESHOLD && " · tekrar et"}
                          </>
                        ) : (
                          "Henüz gelmedi"
                        )}
                        {current && " · bu hafta"}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRightIcon, CalendarClockIcon } from "lucide-react";

import { courseColor } from "@/lib/colors";
import { nextExam } from "@/lib/exams";
import { getCurrentWeek, relativeDays, todayISO } from "@/lib/semester";
import type { CourseBundle } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CourseCard({ course, index = 0 }: { course: CourseBundle; index?: number }) {
  const today = todayISO();
  const info = getCurrentWeek(course, today);
  const hex = courseColor(course.color);
  const total = course.weeks.reduce((s, w) => s + w.topicsTotal, 0);
  const done = course.weeks.reduce((s, w) => s + w.topicsDone, 0);
  const exam = nextExam(course, today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/dersler/${course.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-5 outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-black/[0.04] focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-[0.08] transition-opacity group-hover:opacity-[0.14]"
          style={{ background: `linear-gradient(to bottom, ${hex}, transparent)` }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: hex }} />
            <h3 className="truncate font-medium tracking-tight">{course.name}</h3>
          </div>
          <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </div>

        <p className="relative mt-1 text-[13px] text-muted-foreground">
          {info.status === "upcoming" && `${info.daysToStart} gün sonra başlıyor`}
          {info.status === "active" && (
            <>
              <span className="tabular text-foreground/90">Hafta {info.week}</span> / {course.week_count}
            </>
          )}
          {info.status === "finished" && "Dönem tamamlandı"}
        </p>

        {/* Haftalık seviye mini grafiği */}
        <div className="relative mt-5 flex h-12 items-end gap-[3px]" aria-hidden>
          {course.weeks.map((w) => {
            const isCurrent = info.status === "active" && w.week_number === info.week;
            const past = info.status === "finished" || (info.status === "active" && w.week_number <= info.week);
            return (
              <div key={w.id} className="relative flex h-full flex-1 items-end">
                <div className="absolute inset-0 rounded-[2px] bg-muted/60" />
                <div
                  className={cn("relative w-full rounded-[2px] transition-[height]", !past && "opacity-40")}
                  style={{ height: `${Math.max(w.level, 4)}%`, backgroundColor: w.level > 0 ? hex : "transparent" }}
                />
                {isCurrent && (
                  <div className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground/70" />
                )}
              </div>
            );
          })}
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t pt-4 text-[13px] text-muted-foreground">
          <span className="tabular">
            {total === 0 ? "Konu yok" : (
              <>
                <span className="text-foreground/90">{done}</span>/{total} konu
              </>
            )}
          </span>
          {exam ? (
            <span className={cn("flex items-center gap-1.5", exam.days <= 7 && "text-warning")}>
              <CalendarClockIcon className="size-3.5" />
              {exam.label} · {relativeDays(exam.days).toLocaleLowerCase("tr-TR")}
            </span>
          ) : (
            <span className="text-muted-foreground/60">Sınav tarihi yok</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

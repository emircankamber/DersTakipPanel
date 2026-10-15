"use client";

import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { FadeIn } from "@/components/fade-in";
import { courseColor } from "@/lib/colors";
import type { CourseBundle } from "@/lib/data";
import { nextExam } from "@/lib/exams";
import { getCurrentWeek, todayISO } from "@/lib/semester";
import { cn } from "@/lib/utils";

export function CourseCard({ course, index = 0 }: { course: CourseBundle; index?: number }) {
  const today = todayISO();
  const info = getCurrentWeek(course, today);
  const color = courseColor(course.color);
  const total = course.weeks.reduce((s, w) => s + w.topicsTotal, 0);
  const done = course.weeks.reduce((s, w) => s + w.topicsDone, 0);
  const exam = nextExam(course, today);
  const elapsed = info.status === "upcoming" ? 0 : info.status === "finished" ? course.week_count : info.week;
  const past = course.weeks.slice(0, elapsed);
  const avg = past.length ? Math.round(past.reduce((s, w) => s + w.level, 0) / past.length) : null;

  return (
    <FadeIn delay={index * 0.05}>
      <Link
        href={`/dersler/${course.id}`}
        className="surface surface-interactive group relative flex h-full flex-col overflow-hidden p-6 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        {/* Dersin rengiyle köşeden yayılan hafif ışık */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-50"
          style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
        />

        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="eyebrow">
              {info.status === "upcoming" && `${info.daysToStart} gün sonra`}
              {info.status === "active" && `Hafta ${info.week} / ${course.week_count}`}
              {info.status === "finished" && "Tamamlandı"}
            </span>
          </span>
          <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </div>

        <h3 className="relative mt-4 line-clamp-2 font-display text-[28px] leading-[1.1]">{course.name}</h3>

        {/* Haftalık seviye — her çubuk bir hafta */}
        <div className="relative mt-8 flex h-16 items-end gap-1" aria-hidden>
          {course.weeks.map((w) => {
            const isCurrent = info.status === "active" && w.week_number === info.week;
            const isPast = w.week_number <= elapsed;
            return (
              <div key={w.id} className="relative flex h-full flex-1 items-end">
                <div className={cn("absolute inset-0 rounded-[3px]", isPast ? "bg-foreground/[0.06]" : "border border-dashed border-foreground/10")} />
                {w.level > 0 && (
                  <div
                    className={cn("relative w-full rounded-[3px]", !isPast && "opacity-40")}
                    style={{ height: `${Math.max(w.level, 6)}%`, backgroundColor: color }}
                  />
                )}
                {isCurrent && <div className="absolute -bottom-2.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground" />}
              </div>
            );
          })}
        </div>

        <dl className="relative mt-8 grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <dt className="text-[11px] text-muted-foreground">Ortalama</dt>
            <dd className="mt-1 font-display text-2xl leading-none tabular">{avg ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">Konu</dt>
            <dd className="mt-1 font-display text-2xl leading-none tabular">
              {done}
              <span className="text-base text-muted-foreground">/{total}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted-foreground">{exam ? exam.label : "Sınav"}</dt>
            <dd className={cn("mt-1 font-display text-2xl leading-none tabular", exam && exam.days <= 7 && "text-warning")}>
              {exam ? (
                <>
                  {exam.days}
                  <span className="ml-1 font-sans text-xs text-muted-foreground">gün</span>
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </Link>
    </FadeIn>
  );
}

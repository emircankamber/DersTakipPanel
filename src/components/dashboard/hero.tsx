import Link from "next/link";
import { ArrowUpRightIcon, CalendarClockIcon, ClipboardListIcon } from "lucide-react";

import { CountUp } from "@/components/count-up";
import { FadeIn } from "@/components/fade-in";
import { KIND_LABEL, daysLeft, formatDue } from "@/lib/assignments";
import { courseColor } from "@/lib/colors";
import type { DashboardData, ExamItem } from "@/lib/dashboard";
import { REVIEW_THRESHOLD, levelLabel } from "@/lib/levels";
import { formatLong } from "@/lib/semester";
import type { Assignment } from "@/lib/types";
import { cn } from "@/lib/utils";

type Deadline = Assignment & { course: { name: string; color: string } | undefined };

/** "Bu hafta" kartı: aktif derslerin bu haftaki seviyesi ve konu ilerlemesi. */
function ThisWeek({ data }: { data: DashboardData }) {
  const active = data.courses.filter((c) => c.info.status === "active");
  const levels = active.map((c) => c.levels[c.info.week - 1] ?? 0);
  const avg = levels.length ? Math.round(levels.reduce((s, v) => s + v, 0) / levels.length) : 0;

  return (
    <FadeIn delay={0.05} className="surface relative overflow-hidden p-6 sm:p-8 lg:col-span-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
      />
      <div className="relative flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Bu haftanın ortalaması</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-7xl leading-none tabular sm:text-8xl">
              {active.length ? <CountUp value={avg} /> : "—"}
            </span>
            {active.length > 0 && <span className="text-lg text-muted-foreground">/100</span>}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {active.length === 0
              ? "Aktif haftada ders yok."
              : avg < REVIEW_THRESHOLD
                ? "Hafta henüz oturmadı — konuları işaretledikçe yükselecek."
                : `${levelLabel(avg)} gidiyor. Böyle devam.`}
          </p>
        </div>
      </div>

      {active.length > 0 && (
        <ul className="relative mt-8 grid gap-4 border-t pt-6">
          {active.map((c) => {
            const level = c.levels[c.info.week - 1] ?? 0;
            return (
              <li key={c.id}>
                <Link href={`/dersler/${c.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,200px)_1fr_auto]">
                  <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-3">
                    <span className="h-4 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: courseColor(c.color) }} />
                    <span className="truncate text-sm group-hover:text-foreground">{c.name}</span>
                  </span>
                  <span className="col-span-2 col-start-1 row-start-2 h-1.5 overflow-hidden rounded-full bg-muted sm:col-span-1 sm:col-start-2 sm:row-start-1">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${Math.max(level, 2)}%`, backgroundColor: courseColor(c.color) }}
                    />
                  </span>
                  <span className="col-start-2 row-start-1 text-right font-mono text-xs text-muted-foreground tabular sm:col-start-3">
                    H{c.info.week} · {level}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </FadeIn>
  );
}

function NextDeadline({ item, today }: { item?: Deadline; today: string }) {
  if (!item) {
    return (
      <FadeIn delay={0.1} className="surface flex flex-col justify-between p-6">
        <p className="eyebrow">Sıradaki teslim</p>
        <div className="mt-6">
          <ClipboardListIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">Açık ödev ya da proje yok.</p>
          <Link href="/odevler" className="mt-1 inline-block text-sm text-foreground underline-offset-4 hover:underline">
            Ödev ekle
          </Link>
        </div>
      </FadeIn>
    );
  }
  const d = daysLeft(item.due_at, today);
  return (
    <FadeIn delay={0.1}>
      <Link href="/odevler" className="surface surface-interactive group flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Sıradaki teslim</p>
          <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-base font-medium">{item.title}</p>
            <p className="mt-1 flex items-center gap-2 truncate text-xs text-muted-foreground">
              <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: courseColor(item.course?.color ?? "") }} />
              {KIND_LABEL[item.kind]} · {item.course?.name} · {formatDue(item.due_at)}
            </p>
          </div>
          <div className={cn("shrink-0 text-right", d < 0 ? "text-destructive" : d <= 3 ? "text-warning" : "")}>
            <div className="font-display text-5xl leading-none tabular">{Math.abs(d)}</div>
            <div className="mt-1 text-xs">{d < 0 ? "gün gecikti" : d === 0 ? "bugün" : "gün"}</div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

function NextExam({ exam }: { exam?: ExamItem }) {
  if (!exam) {
    return (
      <FadeIn delay={0.15} className="surface flex flex-col justify-between p-6">
        <p className="eyebrow">Sıradaki sınav</p>
        <div className="mt-6">
          <CalendarClockIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">Vize/final tarihi girilmemiş.</p>
        </div>
      </FadeIn>
    );
  }
  return (
    <FadeIn delay={0.15}>
      <Link href={`/dersler/${exam.courseId}`} className="surface surface-interactive group flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Sıradaki sınav</p>
          <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-base font-medium">
              {exam.courseName} <span className="font-display text-lg text-muted-foreground italic">{exam.label.toLocaleLowerCase("tr-TR")}</span>
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{formatLong(exam.date)}</p>
          </div>
          <div className={cn("shrink-0 text-right", exam.days <= 7 && "text-warning")}>
            <div className="font-display text-5xl leading-none tabular">{exam.days}</div>
            <div className="mt-1 text-xs">{exam.days === 0 ? "bugün" : "gün"}</div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

export function Hero({ data, deadlines }: { data: DashboardData; deadlines: Deadline[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <ThisWeek data={data} />
      <div className="grid gap-4 lg:col-span-5 lg:grid-rows-2">
        <NextDeadline item={deadlines[0]} today={data.today} />
        <NextExam exam={data.exams[0]} />
      </div>
    </div>
  );
}

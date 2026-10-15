import Link from "next/link";
import { CalendarCheck2Icon } from "lucide-react";

import { courseColor } from "@/lib/colors";
import type { ExamItem } from "@/lib/dashboard";
import { formatLong } from "@/lib/semester";
import { cn } from "@/lib/utils";
import { Section } from "./section";

export function ExamCountdown({ exams }: { exams: ExamItem[] }) {
  const shown = exams.slice(0, 4);
  return (
    <Section
      id="exams-title"
      title="Sınav geri sayımı"
      description={exams.length ? `${exams.length} yaklaşan sınav` : "Yaklaşan sınav yok"}
    >
      {shown.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
          <CalendarCheck2Icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-[13px] text-muted-foreground">
            Ders ayarlarından vize ve final tarihlerini ekleyince burada geri sayım başlar.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {shown.map((e) => {
            const urgent = e.days <= 7;
            return (
              <li key={`${e.courseId}-${e.label}`}>
                <Link
                  href={`/dersler/${e.courseId}`}
                  className="group flex items-center gap-4 rounded-xl border px-4 py-4 transition-colors hover:border-border-strong hover:bg-accent/40"
                >
                  <div className="w-14 shrink-0 text-center">
                    <div className={cn("font-display text-4xl leading-none tabular", urgent && "text-warning")}>
                      {e.days}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{e.days === 0 ? "bugün" : "gün"}</div>
                  </div>
                  <div className="min-w-0 flex-1 border-l pl-4">
                    <div className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: courseColor(e.color) }} />
                      <span className="truncate text-sm font-medium">{e.courseName}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {e.label} · {formatLong(e.date)}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

import Link from "next/link";
import { ArrowUpRightIcon, SparklesIcon } from "lucide-react";

import { courseColor } from "@/lib/colors";
import type { ReviewItem } from "@/lib/dashboard";
import { REVIEW_THRESHOLD, levelLabel } from "@/lib/levels";
import { Section } from "./section";

export function ReviewList({ items }: { items: ReviewItem[] }) {
  const shown = items.slice(0, 8);
  return (
    <Section
      id="review-title"
      title="Tekrar et"
      description={`Seviyesi ${REVIEW_THRESHOLD}'ın altındaki geçmiş haftalar, en zayıftan başlayarak`}
    >
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
          <SparklesIcon className="size-5 text-brand" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-medium">Tekrar listesi temiz</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Geçen haftaların hepsi {REVIEW_THRESHOLD} ve üstünde.</p>
        </div>
      ) : (
        <>
          <ul className="-mx-2 flex flex-col">
            {shown.map((r) => (
              <li key={`${r.courseId}-${r.week}`}>
                <Link
                  href={`/dersler/${r.courseId}?hafta=${r.week}`}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: courseColor(r.color) }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{r.courseName}</div>
                    <div className="truncate text-xs text-muted-foreground tabular">
                      {r.week}. hafta{r.isCurrent && " · bu hafta"}
                      {r.topicsTotal > 0 && ` · ${r.topicsDone}/${r.topicsTotal} konu`}
                    </div>
                  </div>
                  <div className="flex w-20 shrink-0 items-center gap-2 sm:w-24">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-warning" style={{ width: `${Math.max(r.level, 2)}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs tabular" title={levelLabel(r.level)}>
                      {r.level}
                    </span>
                  </div>
                  <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
          {items.length > shown.length && (
            <p className="mt-3 text-xs text-muted-foreground">+{items.length - shown.length} hafta daha</p>
          )}
        </>
      )}
    </Section>
  );
}

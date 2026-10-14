import Link from "next/link";
import { ArrowRightIcon, ClipboardCheckIcon } from "lucide-react";

import { KIND_LABEL, dueLabel, formatDue, urgency } from "@/lib/assignments";
import { courseColor } from "@/lib/colors";
import type { Assignment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Section } from "./section";

type Item = Assignment & { course: { name: string; color: string } | undefined };

export function Deadlines({ items, today }: { items: Item[]; today: string }) {
  const shown = items.slice(0, 6);
  return (
    <Section
      id="deadlines-title"
      title="Yaklaşan teslimler"
      description={items.length ? `${items.length} açık ödev ve proje` : "Açık ödev ya da proje yok"}
      action={
        <Link href="/odevler" className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
          Tümü <ArrowRightIcon className="size-3" />
        </Link>
      }
    >
      {shown.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
          <ClipboardCheckIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-[13px] text-muted-foreground">Ödev ve projelerini ekle; teslimler burada sıralanır.</p>
        </div>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {shown.map((a) => {
            const u = urgency(a, today);
            return (
              <li key={a.id}>
                <Link
                  href="/odevler"
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: courseColor(a.course?.color ?? "") }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{a.title}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {KIND_LABEL[a.kind]} · {a.course?.name} · {formatDue(a.due_at)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium tabular",
                      u === "overdue" ? "text-destructive" : u === "soon" ? "text-warning" : "text-muted-foreground",
                    )}
                  >
                    {dueLabel(a, today)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

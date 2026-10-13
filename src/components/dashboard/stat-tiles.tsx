import { ActivityIcon, ListChecksIcon, RotateCcwIcon, type LucideIcon } from "lucide-react";

import { FadeIn } from "@/components/fade-in";
import type { DashboardData } from "@/lib/dashboard";
import { REVIEW_THRESHOLD } from "@/lib/levels";

function Tile({
  icon: Icon,
  label,
  short,
  value,
  suffix,
  hint,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  short: string;
  value: React.ReactNode;
  suffix?: string;
  hint: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} className="min-w-0 rounded-xl border bg-card p-3.5 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-[13px]">
        <Icon className="hidden size-3.5 shrink-0 sm:block" />
        <span className="truncate sm:hidden">{short}</span>
        <span className="hidden truncate sm:inline">{label}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-1 sm:mt-3">
        <span className="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground sm:text-sm">{suffix}</span>}
      </div>
      <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{hint}</p>
    </FadeIn>
  );
}

export function StatTiles({ stats }: { stats: DashboardData["stats"] }) {
  const pct = stats.topicsTotal ? Math.round((stats.topicsDone / stats.topicsTotal) * 100) : null;
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <Tile
        icon={ActivityIcon}
        label="Ortalama seviye"
        short="Ortalama"
        value={stats.avgLevel ?? "—"}
        suffix={stats.avgLevel !== null ? "/100" : undefined}
        hint="Geçen ve bu haftanın ortalaması"
        delay={0}
      />
      <Tile
        icon={ListChecksIcon}
        label="Tamamlanan konu"
        short="Konular"
        value={stats.topicsDone}
        suffix={`/ ${stats.topicsTotal}`}
        hint={pct === null ? "Henüz konu eklenmedi" : `Tüm konuların %${pct}'i`}
        delay={0.04}
      />
      <Tile
        icon={RotateCcwIcon}
        label="Tekrar bekleyen"
        short="Tekrar"
        value={stats.reviewCount}
        suffix="hafta"
        hint={`Seviyesi ${REVIEW_THRESHOLD}'ın altında kalan haftalar`}
        delay={0.08}
      />
    </div>
  );
}

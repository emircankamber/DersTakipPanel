import { CountUp } from "@/components/count-up";
import { FadeIn } from "@/components/fade-in";
import type { DashboardData } from "@/lib/dashboard";
import { REVIEW_THRESHOLD } from "@/lib/levels";

function Stat({ label, short, value, suffix, hint }: { label: string; short: string; value: number | null; suffix?: string; hint: string }) {
  return (
    <div className="min-w-0 px-4 py-6 first:pl-6 sm:px-8 sm:first:pl-8">
      <p className="eyebrow truncate"><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{label}</span></p>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-display text-[32px] leading-none tabular sm:text-5xl">
          {value === null ? "—" : <CountUp value={value} />}
        </span>
        {suffix && value !== null && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <p className="mt-2 hidden text-xs text-muted-foreground sm:block">{hint}</p>
    </div>
  );
}

/** Dönem geneli üç sayı — tek yüzeyde, ince ayraçlarla. */
export function StatTiles({ stats }: { stats: DashboardData["stats"] }) {
  const pct = stats.topicsTotal ? Math.round((stats.topicsDone / stats.topicsTotal) * 100) : null;
  return (
    <FadeIn delay={0.2} className="surface grid grid-cols-3 divide-x">
      <Stat label="Dönem ortalaması" short="Ortalama" value={stats.avgLevel} suffix="/100" hint="Geçen ve bu haftanın seviyesi" />
      <Stat
        label="Konular"
        short="Konular"
        value={stats.topicsDone}
        suffix={`/ ${stats.topicsTotal}`}
        hint={pct === null ? "Henüz konu eklenmedi" : `Tüm konuların %${pct}'i işaretli`}
      />
      <Stat label="Tekrar bekleyen" short="Tekrar" value={stats.reviewCount} suffix="hafta" hint={`Seviyesi ${REVIEW_THRESHOLD}'ın altında`} />
    </FadeIn>
  );
}

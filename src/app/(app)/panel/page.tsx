import type { Metadata } from "next";
import { LayoutDashboardIcon } from "lucide-react";

import { NewCourseButton } from "@/components/courses/new-course-button";
import { CompletionRings } from "@/components/dashboard/completion-rings";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { Heatmap } from "@/components/dashboard/heatmap";
import { LevelChart } from "@/components/dashboard/level-chart";
import { ReviewList } from "@/components/dashboard/review-list";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { buildDashboard } from "@/lib/dashboard";
import { loadCourseBundles } from "@/lib/data";
import { formatLong } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Özet" };

function weekSummary(data: ReturnType<typeof buildDashboard>) {
  const active = data.courses.filter((c) => c.info.status === "active");
  if (active.length === 0) {
    if (data.courses.every((c) => c.info.status === "upcoming")) return "Dönem henüz başlamadı";
    if (data.courses.every((c) => c.info.status === "finished")) return "Dönem tamamlandı";
    return null;
  }
  const weeks = [...new Set(active.map((c) => c.info.week))].sort((a, b) => a - b);
  return weeks.length === 1
    ? `Dönemin ${weeks[0]}. haftası`
    : `${weeks[0]}–${weeks.at(-1)}. haftalar (derslere göre)`;
}

export default async function PanelPage() {
  const supabase = await createClient();
  const bundles = await loadCourseBundles(supabase);
  const data = buildDashboard(bundles);
  const summary = weekSummary(data);

  if (data.courses.length === 0) {
    return (
      <>
        <PageHeader title="Özet" description={formatLong(data.today)} />
        <EmptyState
          icon={LayoutDashboardIcon}
          title="Özetin burada şekillenecek"
          description="İlk dersini ekle; haftalık seviyeler, tamamlama halkaları, ısı haritası ve sınav geri sayımı burada toplanır."
          action={<NewCourseButton label="İlk dersini ekle" />}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Özet"
        description={
          <>
            {formatLong(data.today)}
            {summary && (
              <>
                <span className="mx-2 text-foreground/20">/</span>
                <span className="text-foreground/80">{summary}</span>
              </>
            )}
          </>
        }
      />

      <div className="grid gap-4">
        <StatTiles stats={data.stats} />
        <div className="grid gap-4 lg:grid-cols-3">
          <LevelChart courses={data.courses} maxWeeks={data.maxWeeks} />
          <CompletionRings courses={data.courses} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Heatmap courses={data.courses} maxWeeks={data.maxWeeks} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ReviewList items={data.review} />
          <ExamCountdown exams={data.exams} />
        </div>
      </div>
    </>
  );
}

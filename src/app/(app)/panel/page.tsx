import type { Metadata } from "next";
import { LayoutDashboardIcon } from "lucide-react";

import { NewCourseButton } from "@/components/courses/new-course-button";
import { CompletionRings } from "@/components/dashboard/completion-rings";
import { Deadlines } from "@/components/dashboard/deadlines";
import { Hero } from "@/components/dashboard/hero";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { Heatmap } from "@/components/dashboard/heatmap";
import { LevelChart } from "@/components/dashboard/level-chart";
import { ReviewList } from "@/components/dashboard/review-list";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { daysLeft } from "@/lib/assignments";
import { buildDashboard } from "@/lib/dashboard";
import { loadCourseBundles } from "@/lib/data";
import { TIME_ZONE, formatLong } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";
import type { Assignment } from "@/lib/types";

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

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", hour12: false }).format(new Date()),
  );
  if (hour < 5) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

export default async function PanelPage() {
  const supabase = await createClient();
  const [bundles, { data: openAssignments }] = await Promise.all([
    loadCourseBundles(supabase),
    supabase
      .from("assignments")
      .select("id, course_id, kind, title, description, due_at, status, completed_at, created_at")
      .neq("status", "done")
      .order("due_at")
      .limit(20),
  ]);
  const data = buildDashboard(bundles);
  const courseById = new Map(bundles.map((c) => [c.id, { name: c.name, color: c.color }]));
  const deadlines = ((openAssignments ?? []) as Assignment[]).map((a) => ({ ...a, course: courseById.get(a.course_id) }));
  const summary = weekSummary(data);

  if (data.courses.length === 0) {
    return (
      <>
        <PageHeader eyebrow={formatLong(data.today)} title={<>{greeting()}. <em>Dönemini kur.</em></>} />
        <EmptyState
          icon={LayoutDashboardIcon}
          title="Özetin burada şekillenecek"
          description="İlk dersini ekle; haftalık seviyeler, tamamlama halkaları, ısı haritası ve sınav geri sayımı burada toplanır."
          action={<NewCourseButton label="İlk dersini ekle" />}
        />
      </>
    );
  }

  const openCount = deadlines.length;
  const soon = deadlines.filter((a) => daysLeft(a.due_at, data.today) <= 7).length;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            {formatLong(data.today)}
            {summary && <> · {summary}</>}
          </>
        }
        title={
          <>
            {greeting()}.{" "}
            <em>
              {soon > 0
                ? `Bu hafta ${soon} teslim var.`
                : openCount > 0
                  ? "Bu hafta teslim yok."
                  : data.review.length > 0
                    ? `${data.review.length} hafta tekrar bekliyor.`
                    : "Her şey yolunda."}
            </em>
          </>
        }
      />

      <div className="grid gap-4">
        <Hero data={data} deadlines={deadlines} />
        <StatTiles stats={data.stats} />
        <div className="grid gap-4 lg:grid-cols-3">
          <LevelChart courses={data.courses} maxWeeks={data.maxWeeks} />
          <CompletionRings courses={data.courses} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Heatmap courses={data.courses} maxWeeks={data.maxWeeks} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Deadlines items={deadlines} today={data.today} />
          <ExamCountdown exams={data.exams} />
          <div className="lg:col-span-2 xl:col-span-1">
            <ReviewList items={data.review} />
          </div>
        </div>
      </div>
    </>
  );
}

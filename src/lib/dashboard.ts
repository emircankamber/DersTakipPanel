import type { CourseBundle } from "@/lib/data";
import { upcomingExams, type ExamKind } from "@/lib/exams";
import { REVIEW_THRESHOLD } from "@/lib/levels";
import { getCurrentWeek, todayISO, type WeekInfo } from "@/lib/semester";

/** Özet sayfasının tüm türetilmiş verisi — sunucuda hesaplanır, istemciye düz JSON gider. */
export type DashboardCourse = {
  id: string;
  name: string;
  color: string;
  weekCount: number;
  info: WeekInfo;
  /** Ortalamaya giren (geçmiş + bu) haftaların sayısı. */
  elapsed: number;
  levels: number[]; // index = week_number - 1
  topicsTotal: number;
  topicsDone: number;
};

export type ReviewItem = {
  courseId: string;
  courseName: string;
  color: string;
  week: number;
  level: number;
  topicsTotal: number;
  topicsDone: number;
  isCurrent: boolean;
};

export type ExamItem = {
  courseId: string;
  courseName: string;
  color: string;
  label: ExamKind;
  date: string;
  days: number;
};

export type DashboardData = {
  today: string;
  courses: DashboardCourse[];
  review: ReviewItem[];
  exams: ExamItem[];
  maxWeeks: number;
  stats: {
    avgLevel: number | null;
    topicsDone: number;
    topicsTotal: number;
    reviewCount: number;
  };
};

/** Değerlendirmeye giren hafta sayısı: başlamadıysa 0, bittiyse tümü. */
function elapsedWeeks(info: WeekInfo, weekCount: number) {
  if (info.status === "upcoming") return 0;
  if (info.status === "finished") return weekCount;
  return info.week;
}

export function buildDashboard(bundles: CourseBundle[], today = todayISO()): DashboardData {
  const courses: DashboardCourse[] = bundles.map((c) => {
    const info = getCurrentWeek(c, today);
    const levels = Array.from({ length: c.week_count }, (_, i) => c.weeks.find((w) => w.week_number === i + 1)?.level ?? 0);
    return {
      id: c.id,
      name: c.name,
      color: c.color,
      weekCount: c.week_count,
      info,
      elapsed: elapsedWeeks(info, c.week_count),
      levels,
      topicsTotal: c.weeks.reduce((s, w) => s + w.topicsTotal, 0),
      topicsDone: c.weeks.reduce((s, w) => s + w.topicsDone, 0),
    };
  });

  const review: ReviewItem[] = [];
  for (const b of bundles) {
    const c = courses.find((x) => x.id === b.id)!;
    for (const w of b.weeks) {
      if (w.week_number > c.elapsed || w.level >= REVIEW_THRESHOLD) continue;
      review.push({
        courseId: c.id,
        courseName: c.name,
        color: c.color,
        week: w.week_number,
        level: w.level,
        topicsTotal: w.topicsTotal,
        topicsDone: w.topicsDone,
        isCurrent: c.info.status === "active" && c.info.week === w.week_number,
      });
    }
  }
  // En zayıf önce; eşitlikte eski hafta önce (unutulma riski daha yüksek).
  review.sort((a, b) => a.level - b.level || a.week - b.week || a.courseName.localeCompare(b.courseName, "tr"));

  const exams: ExamItem[] = bundles
    .flatMap((c) =>
      upcomingExams(c, today).map((e) => ({
        courseId: c.id,
        courseName: c.name,
        color: c.color,
        ...e,
      })),
    )
    .sort((a, b) => a.days - b.days);

  const elapsedLevels = courses.flatMap((c) => c.levels.slice(0, c.elapsed));
  const topicsTotal = courses.reduce((s, c) => s + c.topicsTotal, 0);
  const topicsDone = courses.reduce((s, c) => s + c.topicsDone, 0);

  return {
    today,
    courses,
    review,
    exams,
    maxWeeks: Math.max(0, ...courses.map((c) => c.weekCount)),
    stats: {
      avgLevel: elapsedLevels.length
        ? Math.round(elapsedLevels.reduce((s, v) => s + v, 0) / elapsedLevels.length)
        : null,
      topicsDone,
      topicsTotal,
      reviewCount: review.length,
    },
  };
}

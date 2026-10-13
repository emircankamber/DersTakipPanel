import { daysBetween, todayISO } from "@/lib/semester";

export type ExamKind = "Vize" | "Final";

export function upcomingExams(
  course: { midterm_date: string | null; final_date: string | null },
  today: string = todayISO(),
) {
  return (
    [
      { label: "Vize" as ExamKind, date: course.midterm_date },
      { label: "Final" as ExamKind, date: course.final_date },
    ].filter((e): e is { label: ExamKind; date: string } => Boolean(e.date) && e.date! >= today)
  ).map((e) => ({ ...e, days: daysBetween(today, e.date) }));
}

export function nextExam(
  course: { midterm_date: string | null; final_date: string | null },
  today: string = todayISO(),
) {
  return upcomingExams(course, today)[0] ?? null;
}

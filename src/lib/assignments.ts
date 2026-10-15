import { daysBetween, TIME_ZONE, todayISO } from "@/lib/semester";
import type { Assignment, AssignmentKind, AssignmentStatus } from "@/lib/types";

export const KIND_LABEL: Record<AssignmentKind, string> = { odev: "Ödev", proje: "Proje" };

export const STATUS_LABEL: Record<AssignmentStatus, string> = {
  todo: "Yapılacak",
  in_progress: "Devam ediyor",
  done: "Tamamlandı",
};

export const STATUS_ORDER: AssignmentStatus[] = ["todo", "in_progress", "done"];

/** Hatırlatma e-postalarının gönderildiği eşikler (gün). */
export const REMINDER_OFFSETS = [7, 3, 1] as const;

/** Türkiye 2016'dan beri sabit UTC+3. */
const TR_OFFSET = "+03:00";

/** Formdaki tarih + saat (TR saati) → ISO zaman damgası. */
export function toDueAt(date: string, time: string): string {
  return new Date(`${date}T${time || "23:59"}:00${TR_OFFSET}`).toISOString();
}

/** Zaman damgası → TR saatine göre { date: YYYY-MM-DD, time: HH:mm } */
export function splitDueAt(dueAt: string): { date: string; time: string } {
  const d = new Date(dueAt);
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return { date, time };
}

/** Teslime kalan gün (TR takvimine göre; bugün = 0, geçmiş = negatif). */
export function daysLeft(dueAt: string, today = todayISO()): number {
  return daysBetween(today, splitDueAt(dueAt).date);
}

const dueFmt = new Intl.DateTimeFormat("tr-TR", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  weekday: "short",
});

export function formatDue(dueAt: string): string {
  const { time } = splitDueAt(dueAt);
  return `${dueFmt.format(new Date(dueAt))} · ${time}`;
}

export function dueLabel(a: Pick<Assignment, "due_at" | "status">, today = todayISO()): string {
  if (a.status === "done") return "Tamamlandı";
  const d = daysLeft(a.due_at, today);
  if (d < 0) return `${-d} gün gecikti`;
  if (d === 0) return "Bugün teslim";
  if (d === 1) return "Yarın teslim";
  return `${d} gün kaldı`;
}

export type Urgency = "overdue" | "soon" | "week" | "later" | "done";

export function urgency(a: Pick<Assignment, "due_at" | "status">, today = todayISO()): Urgency {
  if (a.status === "done") return "done";
  const d = daysLeft(a.due_at, today);
  if (d < 0) return "overdue";
  if (d <= 3) return "soon";
  if (d <= 7) return "week";
  return "later";
}

export function sortByDue(a: Assignment, b: Assignment) {
  return a.due_at.localeCompare(b.due_at);
}

const dayFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TIME_ZONE, day: "numeric" });
const monFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TIME_ZONE, month: "short" });
const wdFmt = new Intl.DateTimeFormat("tr-TR", { timeZone: TIME_ZONE, weekday: "short" });

/** Ajanda sütunu için: { day: "15", month: "Eki", weekday: "Per", time: "23:59" } */
export function dueParts(dueAt: string) {
  const d = new Date(dueAt);
  return {
    day: dayFmt.format(d),
    month: monFmt.format(d),
    weekday: wdFmt.format(d),
    time: splitDueAt(dueAt).time,
  };
}

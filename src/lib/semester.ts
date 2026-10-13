/**
 * Dönem/hafta hesapları. Tüm tarihler "YYYY-MM-DD" biçiminde ve
 * Türkiye saatine göre değerlendirilir; böylece sunucu (UTC) ile
 * tarayıcı aynı "bugün"ü görür.
 */

export const TIME_ZONE = "Europe/Istanbul";
const DAY_MS = 86_400_000;

export function todayISO(now: Date = new Date()): string {
  // en-CA biçimi YYYY-MM-DD verir.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUTC(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  return new Date(toUTC(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** b - a, gün cinsinden. */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / DAY_MS);
}

export type SemesterStatus = "upcoming" | "active" | "finished";

export type WeekInfo = {
  status: SemesterStatus;
  /** 1..weekCount aralığına sıkıştırılmış hafta. */
  week: number;
  /** Dönem başlamadıysa başlangıca kalan gün. */
  daysToStart: number;
};

export function getCurrentWeek(
  course: { start_date: string; week_count: number },
  today: string = todayISO(),
): WeekInfo {
  const diff = daysBetween(course.start_date, today);
  if (diff < 0) return { status: "upcoming", week: 1, daysToStart: -diff };
  const raw = Math.floor(diff / 7) + 1;
  if (raw > course.week_count)
    return { status: "finished", week: course.week_count, daysToStart: 0 };
  return { status: "active", week: raw, daysToStart: 0 };
}

export function weekRange(startDate: string, weekNumber: number) {
  const start = addDays(startDate, (weekNumber - 1) * 7);
  return { start, end: addDays(start, 6) };
}

const shortFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const longFmt = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  weekday: "long",
  timeZone: "UTC",
});

export function formatShort(iso: string): string {
  return shortFmt.format(new Date(toUTC(iso)));
}

export function formatLong(iso: string): string {
  return longFmt.format(new Date(toUTC(iso)));
}

export function formatRange(startDate: string, weekNumber: number): string {
  const { start, end } = weekRange(startDate, weekNumber);
  return `${formatShort(start)} – ${formatShort(end)}`;
}

/** "Bugün", "Yarın", "5 gün sonra", "3 gün önce" */
export function relativeDays(days: number): string {
  if (days === 0) return "Bugün";
  if (days === 1) return "Yarın";
  if (days === -1) return "Dün";
  return days > 0 ? `${days} gün sonra` : `${-days} gün önce`;
}

export function isValidISODate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const t = toUTC(v);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === v;
}

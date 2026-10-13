/**
 * Ders renk paleti — veri görselleştirme için doğrulanmış 8'li kategorik set.
 * Sıra, renk körlüğü ayrımını garanti eden sıradır; yeni derslere bu sırayla önerilir.
 * Her rengin açık ve koyu temaya ayrı ayarlanmış tonu var (globals.css: --course-*).
 * Veritabanında yalnızca anahtar saklanır.
 */
export const COURSE_COLORS = {
  blue: { label: "Mavi", light: "#2a78d6", dark: "#3987e5" },
  orange: { label: "Turuncu", light: "#eb6834", dark: "#d95926" },
  aqua: { label: "Su yeşili", light: "#1baf7a", dark: "#199e70" },
  yellow: { label: "Hardal", light: "#eda100", dark: "#c98500" },
  magenta: { label: "Pembe", light: "#e87ba4", dark: "#d55181" },
  green: { label: "Yeşil", light: "#008300", dark: "#008300" },
  violet: { label: "Mor", light: "#6250d6", dark: "#9085e9" },
  red: { label: "Kırmızı", light: "#e34948", dark: "#e66767" },
} as const;

export type CourseColor = keyof typeof COURSE_COLORS;

export const COLOR_KEYS = Object.keys(COURSE_COLORS) as CourseColor[];

export function isCourseColor(key: string): key is CourseColor {
  return Object.prototype.hasOwnProperty.call(COURSE_COLORS, key);
}

function safeKey(key: string): CourseColor {
  return isCourseColor(key) ? key : "blue";
}

/** Tema ile otomatik değişen CSS rengi (style içinde kullanın). */
export function courseColor(key: string): string {
  return `var(--course-${safeKey(key)})`;
}

/** Recharts gibi düz hex isteyen yerler için temaya göre hex. */
export function courseHex(key: string, dark: boolean): string {
  const c = COURSE_COLORS[safeKey(key)];
  return dark ? c.dark : c.light;
}

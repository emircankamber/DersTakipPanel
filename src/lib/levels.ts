export const REVIEW_THRESHOLD = 60;

export function levelLabel(level: number): string {
  if (level <= 0) return "Başlanmadı";
  if (level < 40) return "Zayıf";
  if (level < REVIEW_THRESHOLD) return "Orta";
  if (level < 80) return "İyi";
  return "Hakim";
}

export function clampLevel(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

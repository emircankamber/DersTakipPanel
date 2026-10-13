/**
 * Ders renk paleti. Hem koyu hem açık zeminde okunur orta tonlar.
 * Veritabanında anahtar (ör. "emerald") saklanır.
 */
export const COURSE_COLORS = {
  emerald: { label: "Zümrüt", hex: "#10b981" },
  sky: { label: "Gök", hex: "#0ea5e9" },
  rose: { label: "Gül", hex: "#f43f5e" },
  amber: { label: "Kehribar", hex: "#eab308" },
  violet: { label: "Menekşe", hex: "#8b5cf6" },
  teal: { label: "Petrol", hex: "#14b8a6" },
  lime: { label: "Limon", hex: "#84cc16" },
  pink: { label: "Pembe", hex: "#ec4899" },
  slate: { label: "Arduvaz", hex: "#64748b" },
} as const;

export type CourseColor = keyof typeof COURSE_COLORS;

export const COLOR_KEYS = Object.keys(COURSE_COLORS) as CourseColor[];

export function colorHex(key: string): string {
  return (COURSE_COLORS as Record<string, { hex: string }>)[key]?.hex ?? COURSE_COLORS.slate.hex;
}

export function isCourseColor(key: string): key is CourseColor {
  return key in COURSE_COLORS;
}

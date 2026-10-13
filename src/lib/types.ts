import type { CourseColor } from "@/lib/colors";

export type Course = {
  id: string;
  user_id: string;
  name: string;
  color: CourseColor;
  start_date: string; // YYYY-MM-DD
  week_count: number;
  midterm_date: string | null;
  final_date: string | null;
  created_at: string;
};

export type Week = {
  id: string;
  course_id: string;
  week_number: number;
  level: number;
};

export type Topic = {
  id: string;
  week_id: string;
  title: string;
  done: boolean;
  position: number;
  created_at: string;
  /** Yalnızca istemcide: iyimser eklemede animasyon anahtarını sabit tutar. */
  _key?: string;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

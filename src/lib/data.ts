import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Course, Topic, Week } from "@/lib/types";

export type CourseBundle = Course & {
  weeks: (Week & { topicsTotal: number; topicsDone: number })[];
};

/** Kullanıcının tüm derslerini hafta ve konu sayılarıyla birlikte getirir. */
export async function loadCourseBundles(supabase: SupabaseClient): Promise<CourseBundle[]> {
  const [coursesRes, weeksRes, topicsRes] = await Promise.all([
    supabase.from("courses").select("*").order("created_at", { ascending: true }),
    supabase.from("weeks").select("id, course_id, week_number, level").order("week_number"),
    supabase.from("topics").select("week_id, done"),
  ]);

  const courses = (coursesRes.data ?? []) as Course[];
  const weeks = (weeksRes.data ?? []) as Week[];
  const topics = (topicsRes.data ?? []) as Pick<Topic, "week_id" | "done">[];

  const counts = new Map<string, { total: number; done: number }>();
  for (const t of topics) {
    const c = counts.get(t.week_id) ?? { total: 0, done: 0 };
    c.total++;
    if (t.done) c.done++;
    counts.set(t.week_id, c);
  }

  const byCourse = new Map<string, CourseBundle["weeks"]>();
  for (const w of weeks) {
    const c = counts.get(w.id);
    const list = byCourse.get(w.course_id) ?? [];
    list.push({ ...w, topicsTotal: c?.total ?? 0, topicsDone: c?.done ?? 0 });
    byCourse.set(w.course_id, list);
  }

  return courses.map((course) => ({ ...course, weeks: byCourse.get(course.id) ?? [] }));
}

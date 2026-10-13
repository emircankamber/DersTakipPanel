import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseView } from "@/components/courses/course-view";
import { getCurrentWeek } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";
import type { Course, Topic, Week } from "@/lib/types";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ hafta?: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadCourse(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  return { supabase, course: data as Course | null };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const res = await loadCourse(id);
  return { title: res?.course?.name ?? "Ders" };
}

export default async function CoursePage({ params, searchParams }: Params) {
  const [{ id }, { hafta }] = await Promise.all([params, searchParams]);
  const res = await loadCourse(id);
  if (!res?.course) notFound();
  const { supabase, course } = res;

  const { data: weeksData } = await supabase
    .from("weeks")
    .select("id, course_id, week_number, level")
    .eq("course_id", course.id)
    .order("week_number");
  const weeks = (weeksData ?? []) as Week[];

  const { data: topicsData } = weeks.length
    ? await supabase
        .from("topics")
        .select("id, week_id, title, done, position, created_at")
        .in("week_id", weeks.map((w) => w.id))
        .order("position")
        .order("created_at")
    : { data: [] };

  const requested = Number(hafta);
  const initialWeek =
    Number.isInteger(requested) && requested >= 1 && requested <= course.week_count
      ? requested
      : getCurrentWeek(course).week;

  return (
    <CourseView
      key={course.id}
      course={course}
      weeks={weeks}
      topics={(topicsData ?? []) as Topic[]}
      initialWeek={initialWeek}
    />
  );
}

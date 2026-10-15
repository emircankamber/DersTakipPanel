import type { Metadata } from "next";
import { LibraryBigIcon } from "lucide-react";

import { CourseCard } from "@/components/courses/course-card";
import { NewCourseButton } from "@/components/courses/new-course-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { COLOR_KEYS } from "@/lib/colors";
import { loadCourseBundles } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dersler" };

export default async function DerslerPage() {
  const supabase = await createClient();
  const courses = await loadCourseBundles(supabase);

  // Yeni derse kullanılmamış ilk rengi ve son dersin başlangıç tarihini öner.
  const used = new Set(courses.map((c) => c.color));
  const defaults = {
    color: COLOR_KEYS.find((k) => !used.has(k)) ?? COLOR_KEYS[courses.length % COLOR_KEYS.length],
    start_date: courses.at(-1)?.start_date,
  };

  return (
    <>
      <PageHeader
        eyebrow={courses.length > 0 ? `${courses.length} ders` : "Başlangıç"}
        title={
          <>
            Dersler <em>{courses.length > 0 ? "ve haftaları" : "henüz boş"}</em>
          </>
        }
        description={
          courses.length > 0
            ? "Her çubuk bir hafta: yükseklik o haftaki öğrenme seviyen."
            : "Bu dönem aldığın dersleri ekleyerek başla."
        }
        actions={courses.length > 0 && <NewCourseButton defaults={defaults} />}
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={LibraryBigIcon}
          title="Henüz ders eklemedin"
          description="Ders adını, dönem başlangıcını ve sınav tarihlerini gir; haftalar otomatik oluşsun. Sonra her haftanın konularını işaretle."
          action={<NewCourseButton label="İlk dersini ekle" defaults={defaults} />}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      )}
    </>
  );
}

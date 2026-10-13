"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CircleDashedIcon } from "lucide-react";

import { courseColor } from "@/lib/colors";
import type { DashboardCourse } from "@/lib/dashboard";
import { Section } from "./section";

const R = 26;
const C = 2 * Math.PI * R;

function Ring({ course, index }: { course: DashboardCourse; index: number }) {
  const pct = course.topicsTotal ? course.topicsDone / course.topicsTotal : 0;
  const color = courseColor(course.color);
  return (
    <Link
      href={`/dersler/${course.id}`}
      className="group flex flex-col items-center rounded-lg px-2 py-3 text-center transition-colors hover:bg-accent/50"
      title={`${course.name}: ${course.topicsDone}/${course.topicsTotal} konu`}
    >
      <div className="relative size-[72px]">
        <svg viewBox="0 0 64 64" className="size-full -rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" strokeWidth="5" className="stroke-muted" />
          {course.topicsTotal > 0 && (
            <motion.circle
              cx="32"
              cy="32"
              r={R}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              style={{ stroke: color }}
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - Math.max(pct, 0.001)) }}
              transition={{ duration: 0.9, delay: 0.1 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular">
          {course.topicsTotal ? `%${Math.round(pct * 100)}` : <span className="text-muted-foreground">—</span>}
        </div>
      </div>
      <div className="mt-2 w-full truncate text-xs">{course.name}</div>
      <div className="text-[11px] text-muted-foreground tabular">
        {course.topicsTotal ? `${course.topicsDone}/${course.topicsTotal} konu` : "konu yok"}
      </div>
    </Link>
  );
}

export function CompletionRings({ courses }: { courses: DashboardCourse[] }) {
  const anyTopics = courses.some((c) => c.topicsTotal > 0);
  return (
    <Section id="rings-title" title="Tamamlama" description="İşaretlenen konuların oranı">
      {!anyTopics ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
          <CircleDashedIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-2 text-[13px] text-muted-foreground">Haftalara konu ekledikçe halkalar dolacak.</p>
        </div>
      ) : (
        <div className="-mx-2 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-2">
          {courses.map((c, i) => (
            <Ring key={c.id} course={c} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}

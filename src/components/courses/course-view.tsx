"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { deleteCourse } from "@/app/(app)/dersler/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { colorHex } from "@/lib/colors";
import { upcomingExams } from "@/lib/exams";
import { formatRange, formatShort, getCurrentWeek, relativeDays, todayISO } from "@/lib/semester";
import type { Course, Topic, Week } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CourseFormDialog } from "./course-form-dialog";
import { LevelCard } from "./level-card";
import { TopicList } from "./topic-list";
import { WeekStrip } from "./week-strip";

type Props = {
  course: Course;
  weeks: Week[];
  topics: Topic[];
  initialWeek: number;
};

export function CourseView({ course, weeks: initialWeeks, topics: initialTopics, initialWeek }: Props) {
  const [weekNumber, setWeekNumber] = React.useState(initialWeek);
  const [direction, setDirection] = React.useState(0);
  const [levels, setLevels] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(initialWeeks.map((w) => [w.id, w.level])),
  );
  const [topics, setTopics] = React.useState<Topic[]>(initialTopics);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, startDelete] = React.useTransition();

  // Ders düzenlenince (ör. hafta sayısı) sunucudan gelen hafta listesi değişir.
  const weeks = initialWeeks;
  React.useEffect(() => {
    setLevels((prev) => {
      const next: Record<string, number> = {};
      for (const w of initialWeeks) next[w.id] = prev[w.id] ?? w.level;
      return next;
    });
    setTopics((prev) => prev.filter((t) => initialWeeks.some((w) => w.id === t.week_id)));
    setWeekNumber((n) => Math.min(n, Math.max(1, initialWeeks.length)));
  }, [initialWeeks]);

  const today = todayISO();
  const info = getCurrentWeek(course, today);
  const hex = colorHex(course.color);
  const exams = upcomingExams(course, today);
  const week = weeks.find((w) => w.week_number === weekNumber) ?? weeks[0];

  const weekStats = React.useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const t of topics) {
      const s = (map[t.week_id] ??= { total: 0, done: 0 });
      s.total++;
      if (t.done) s.done++;
    }
    return map;
  }, [topics]);

  const goTo = React.useCallback(
    (n: number) => {
      if (n < 1 || n > weeks.length) return;
      setDirection(n > weekNumber ? 1 : -1);
      setWeekNumber(n);
      window.history.replaceState(null, "", `?hafta=${n}`);
    },
    [weeks.length, weekNumber],
  );

  // ← / → ile haftalar arasında gezin (bir alana yazı yazılmıyorken).
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, [role=slider], [contenteditable=true]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") goTo(weekNumber - 1);
      if (e.key === "ArrowRight") goTo(weekNumber + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, weekNumber]);

  function confirmDelete() {
    startDelete(async () => {
      const res = await deleteCourse(course.id);
      // Başarılıysa sunucu /dersler'e yönlendirir; buraya yalnızca hata döner.
      if (res && !res.ok) toast.error(res.error);
    });
  }

  if (!week) return null;

  const isCurrent = info.status === "active" && week.week_number === info.week;

  return (
    <div>
      {/* Başlık */}
      <div className="mb-8 sm:mb-10">
        <Link
          href="/dersler"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Dersler
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="size-3 shrink-0 rounded-full ring-4"
                style={{ backgroundColor: hex, ["--tw-ring-color" as string]: `${hex}26` }}
              />
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-[28px]">{course.name}</h1>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
              <span>
                {info.status === "upcoming" && `Dönem ${relativeDays(info.daysToStart).toLocaleLowerCase("tr-TR")} başlıyor`}
                {info.status === "active" && (
                  <>
                    Şu an <span className="tabular font-medium text-foreground">{info.week}. hafta</span>
                    <span className="tabular"> / {course.week_count}</span>
                  </>
                )}
                {info.status === "finished" && "Dönem tamamlandı"}
              </span>
              {exams.map((e) => (
                <span key={e.label} className={cn("flex items-center gap-1.5", e.days <= 7 && "text-warning")}>
                  <CalendarClockIcon className="size-3.5" />
                  {e.label} {formatShort(e.date)} · {relativeDays(e.days).toLocaleLowerCase("tr-TR")}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="hidden sm:inline-flex">
              <PencilIcon />
              Düzenle
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Ders seçenekleri">
                  <EllipsisIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <PencilIcon />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                  <Trash2Icon />
                  Dersi sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <WeekStrip
        weeks={weeks}
        levels={levels}
        selected={weekNumber}
        current={info.status === "active" ? info.week : null}
        color={hex}
        onSelect={goTo}
      />

      {/* Seçili hafta başlığı */}
      <div className="mt-8 mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold tracking-tight tabular">{week.week_number}. Hafta</h2>
            {isCurrent && (
              <span className="rounded-full border border-brand/30 bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
                Bu hafta
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{formatRange(course.start_date, week.week_number)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goTo(weekNumber - 1)}
            disabled={weekNumber <= 1}
            aria-label="Önceki hafta"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => goTo(weekNumber + 1)}
            disabled={weekNumber >= weeks.length}
            aria-label="Sonraki hafta"
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={week.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -12 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          <TopicList
            weekId={week.id}
            topics={topics.filter((t) => t.week_id === week.id)}
            stats={weekStats[week.id]}
            setTopics={setTopics}
          />
          <LevelCard
            weekId={week.id}
            level={levels[week.id] ?? 0}
            onLocalChange={(v) => setLevels((s) => ({ ...s, [week.id]: v }))}
          />
        </motion.div>
      </AnimatePresence>

      <CourseFormDialog open={editOpen} onOpenChange={setEditOpen} course={course} />

      <AlertDialog open={deleteOpen} onOpenChange={(o) => !deleting && setDeleteOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>&ldquo;{course.name}&rdquo; silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Dersin tüm haftaları, konuları ve öğrenme seviyeleri kalıcı olarak silinir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting && <Loader2Icon className="animate-spin" />}
              Kalıcı olarak sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

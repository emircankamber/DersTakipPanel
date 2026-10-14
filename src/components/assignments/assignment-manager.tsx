"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleDashedIcon,
  CircleDotIcon,
  ClipboardListIcon,
  EllipsisIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { deleteAssignment, setAssignmentStatus } from "@/app/(app)/odevler/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NativeSelect } from "@/components/ui/native-select";
import {
  KIND_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  dueLabel,
  formatDue,
  sortByDue,
  urgency,
  type Urgency,
} from "@/lib/assignments";
import { courseColor } from "@/lib/colors";
import { todayISO } from "@/lib/semester";
import type { Assignment, AssignmentKind, AssignmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AssignmentFormDialog, type CourseOption } from "./assignment-form-dialog";

const GROUPS: { key: Urgency; title: string }[] = [
  { key: "overdue", title: "Gecikmiş" },
  { key: "soon", title: "3 gün içinde" },
  { key: "week", title: "Bu hafta" },
  { key: "later", title: "Daha sonra" },
  { key: "done", title: "Tamamlanan" },
];

const DUE_TONE: Record<Urgency, string> = {
  overdue: "text-destructive",
  soon: "text-warning",
  week: "text-foreground/80",
  later: "text-muted-foreground",
  done: "text-muted-foreground",
};

function StatusIcon({ status }: { status: AssignmentStatus }) {
  if (status === "in_progress") return <CircleDotIcon className="size-[18px] text-brand" />;
  return <CircleDashedIcon className="size-[18px] text-muted-foreground" />;
}

function DoneToggle({ a, onToggle }: { a: Assignment; onToggle: () => void }) {
  const done = a.status === "done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `${a.title}: tamamlanmadı olarak işaretle` : `${a.title}: tamamlandı olarak işaretle`}
      onClick={onToggle}
      className={cn(
        "relative flex size-[18px] shrink-0 items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
        done ? "border-brand bg-brand" : a.status === "in_progress" ? "border-brand/70" : "border-foreground/25 hover:border-foreground/50",
      )}
    >
      {a.status === "in_progress" && !done && <span className="size-2 rounded-full bg-brand" />}
      <svg viewBox="0 0 16 16" className="absolute size-3" fill="none" aria-hidden>
        <motion.path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-foreground"
          initial={false}
          animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </svg>
    </button>
  );
}

function Row({
  a,
  course,
  showCourse,
  today,
  onStatus,
  onEdit,
  onDelete,
}: {
  a: Assignment;
  course?: CourseOption;
  showCourse: boolean;
  today: string;
  onStatus: (s: AssignmentStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const u = urgency(a, today);
  const done = a.status === "done";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="group flex items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-accent/40">
        <div className="pt-0.5">
          <DoneToggle a={a} onToggle={() => onStatus(done ? "todo" : "done")} />
        </div>
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("text-sm font-medium break-words", done && "text-muted-foreground line-through decoration-foreground/30")}>
              {a.title}
            </span>
            <span
              className={cn(
                "rounded border px-1.5 py-px text-[10px] font-medium tracking-wide uppercase",
                a.kind === "proje" ? "border-foreground/20 text-foreground/80" : "text-muted-foreground",
              )}
            >
              {KIND_LABEL[a.kind]}
            </span>
            {a.status === "in_progress" && (
              <span className="text-[11px] font-medium text-brand">{STATUS_LABEL.in_progress}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {showCourse && course && (
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: courseColor(course.color) }} />
                <span className="truncate">{course.name}</span>
              </span>
            )}
            <span className="tabular">{formatDue(a.due_at)}</span>
          </div>
          {a.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">{a.description}</p>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <span className={cn("hidden text-xs font-medium tabular sm:inline", DUE_TONE[u])}>{dueLabel(a, today)}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`${a.title} seçenekleri`} className="text-muted-foreground">
                <EllipsisIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Durum</DropdownMenuLabel>
              {STATUS_ORDER.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => onStatus(s)} className={cn(a.status === s && "font-medium")}>
                  {s === "done" ? (
                    <span className="flex size-4 items-center justify-center">
                      <span className="size-3 rounded-full bg-brand" />
                    </span>
                  ) : (
                    <StatusIcon status={s} />
                  )}
                  {STATUS_LABEL[s]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onEdit}>
                <PencilIcon />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2Icon />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className={cn("-mt-2 mb-1 pl-[38px] text-xs font-medium tabular sm:hidden", DUE_TONE[u])}>{dueLabel(a, today)}</p>
    </motion.li>
  );
}

type Props = {
  initial: Assignment[];
  courses: CourseOption[];
  /** Ders sayfasında: tek derse kilitli, filtre yok. */
  courseId?: string;
  /** Tamamlananları göster/gizle anahtarı ve tür/ders filtreleri. */
  filters?: boolean;
  /** Başlık satırına eklenecek ek öğe (ör. hatırlatma anahtarı). */
  toolbar?: React.ReactNode;
  title?: string;
};

export function AssignmentManager({ initial, courses, courseId, filters = false, toolbar, title }: Props) {
  const [items, setItems] = React.useState<Assignment[]>(initial);
  const [editing, setEditing] = React.useState<Assignment | undefined>();
  const [formOpen, setFormOpen] = React.useState(false);
  const [kind, setKind] = React.useState<AssignmentKind | "all">("all");
  const [course, setCourse] = React.useState<string>("all");
  const [showDone, setShowDone] = React.useState(!filters);
  const today = todayISO();
  const courseMap = React.useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const visible = items
    .filter((a) => (courseId ? a.course_id === courseId : true))
    .filter((a) => kind === "all" || a.kind === kind)
    .filter((a) => course === "all" || a.course_id === course)
    .sort(sortByDue);

  const doneCount = visible.filter((a) => a.status === "done").length;
  const grouped = GROUPS.map((g) => ({
    ...g,
    items: visible.filter((a) => urgency(a, today) === g.key && (g.key !== "done" || showDone)),
  })).filter((g) => g.items.length > 0);

  function upsert(a: Assignment) {
    setItems((list) => (list.some((x) => x.id === a.id) ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a]));
  }

  async function changeStatus(a: Assignment, status: AssignmentStatus) {
    if (a.status === status) return;
    upsert({ ...a, status });
    const res = await setAssignmentStatus(a.id, status);
    if (!res.ok) {
      upsert(a);
      toast.error(res.error);
    } else if (status === "done") {
      toast.success("Tamamlandı", { description: a.title });
    }
  }

  async function remove(a: Assignment) {
    setItems((list) => list.filter((x) => x.id !== a.id));
    const res = await deleteAssignment(a.id);
    if (!res.ok) {
      upsert(a);
      toast.error(res.error);
      return;
    }
    toast("Silindi", { description: a.title });
  }

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const noCourses = courses.length === 0;
  const openCount = visible.length - doneCount;

  return (
    <section className="rounded-xl border bg-card" aria-label={title ?? "Ödev ve projeler"}>
      <header className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium">{title ?? "Ödev ve projeler"}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground tabular">
            {visible.length === 0 ? "Kayıt yok" : `${openCount} açık · ${doneCount} tamamlandı`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <Button size="sm" onClick={openNew} disabled={noCourses}>
            <PlusIcon />
            Yeni
          </Button>
        </div>
      </header>

      {filters && !noCourses && (
        <div className="mt-4 flex flex-wrap items-center gap-2 px-5">
          <div className="flex rounded-lg border bg-muted/40 p-0.5" role="tablist" aria-label="Tür filtresi">
            {(["all", "odev", "proje"] as const).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  "relative h-7 rounded-md px-3 text-xs font-medium transition-colors",
                  kind === k ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {kind === k && (
                  <motion.span
                    layoutId="kind-filter"
                    className="absolute inset-0 rounded-md bg-card shadow-sm ring-1 ring-border"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">{k === "all" ? "Tümü" : k === "odev" ? "Ödevler" : "Projeler"}</span>
              </button>
            ))}
          </div>
          <NativeSelect
            aria-label="Ders filtresi"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-44 [&_select]:h-8 [&_select]:text-xs"
          >
            <option value="all">Tüm dersler</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
          <button
            type="button"
            onClick={() => setShowDone((s) => !s)}
            className="h-8 rounded-md px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {showDone ? "Tamamlananları gizle" : `Tamamlananları göster${doneCount ? ` (${doneCount})` : ""}`}
          </button>
        </div>
      )}

      <div className="px-3 pt-2 pb-3">
        {noCourses ? (
          <div className="m-2 flex flex-col items-center rounded-lg border border-dashed px-4 py-10 text-center">
            <ClipboardListIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-medium">Önce bir ders ekle</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Ödev ve projeler bir derse bağlı olarak tutulur.</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dersler">Derslere git</Link>
            </Button>
          </div>
        ) : grouped.length === 0 ? (
          <div className="m-2 flex flex-col items-center rounded-lg border border-dashed px-4 py-10 text-center">
            <ClipboardListIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-medium">
              {visible.length === 0 ? "Henüz ödev ya da proje yok" : "Açık iş kalmadı"}
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
              {visible.length === 0
                ? "Son teslim tarihiyle ekle; yaklaşınca seni e-postayla uyaralım."
                : "Hepsi tamamlandı. Tamamlananları görmek için filtreyi aç."}
            </p>
            {visible.length === 0 && (
              <Button size="sm" variant="outline" className="mt-4" onClick={openNew}>
                <PlusIcon />
                İlkini ekle
              </Button>
            )}
          </div>
        ) : (
          grouped.map((g) => (
            <div key={g.key} className="mt-2 first:mt-0">
              <h3
                className={cn(
                  "px-2 pt-2 pb-1 text-[11px] font-medium tracking-wide uppercase",
                  g.key === "overdue" ? "text-destructive" : g.key === "soon" ? "text-warning" : "text-muted-foreground/80",
                )}
              >
                {g.title} <span className="tabular">· {g.items.length}</span>
              </h3>
              <ul className="flex flex-col">
                <AnimatePresence initial={false}>
                  {g.items.map((a) => (
                    <Row
                      key={a.id}
                      a={a}
                      course={courseMap.get(a.course_id)}
                      showCourse={!courseId}
                      today={today}
                      onStatus={(s) => changeStatus(a, s)}
                      onEdit={() => {
                        setEditing(a);
                        setFormOpen(true);
                      }}
                      onDelete={() => remove(a)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))
        )}
      </div>

      <AssignmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        courses={courses}
        assignment={editing}
        defaultCourseId={courseId ?? (course !== "all" ? course : undefined)}
        onSaved={upsert}
      />
    </section>
  );
}

"use client";

import * as React from "react";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createAssignment,
  updateAssignment,
  type AssignmentInput,
} from "@/app/(app)/odevler/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { KIND_LABEL, STATUS_LABEL, STATUS_ORDER, splitDueAt } from "@/lib/assignments";
import { addDays, todayISO } from "@/lib/semester";
import type { Assignment, AssignmentKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CourseOption = { id: string; name: string; color: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: CourseOption[];
  assignment?: Assignment;
  defaultCourseId?: string;
  onSaved: (a: Assignment) => void;
};

function initial(props: Props): AssignmentInput {
  const a = props.assignment;
  if (a) {
    const { date, time } = splitDueAt(a.due_at);
    return {
      course_id: a.course_id,
      kind: a.kind,
      title: a.title,
      description: a.description ?? "",
      due_date: date,
      due_time: time,
      status: a.status,
    };
  }
  return {
    course_id: props.defaultCourseId ?? props.courses[0]?.id ?? "",
    kind: "odev",
    title: "",
    description: "",
    due_date: addDays(todayISO(), 7),
    due_time: "23:59",
    status: "todo",
  };
}

export function AssignmentFormDialog(props: Props) {
  const { open, onOpenChange, courses, assignment, onSaved } = props;
  const [values, setValues] = React.useState<AssignmentInput>(() => initial(props));
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (open) {
      setValues(initial(props));
      setError(null);
    }
    // Yalnızca açılışta sıfırla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof AssignmentInput>(k: K, v: AssignmentInput[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = assignment ? await updateAssignment(assignment.id, values) : await createAssignment(values);
      if (!res.ok) return setError(res.error);
      toast.success(assignment ? "Güncellendi" : `${KIND_LABEL[values.kind]} eklendi`, {
        description: values.title,
      });
      onSaved(res.assignment);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{assignment ? "Düzenle" : "Yeni ödev / proje"}</DialogTitle>
          <DialogDescription>
            Teslimden 7, 3 ve 1 gün önce e-posta ile hatırlatılır.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <span className="text-[13px] font-medium text-foreground/90">Tür</span>
            <div className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1" role="radiogroup" aria-label="Tür">
              {(["odev", "proje"] as AssignmentKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={values.kind === k}
                  onClick={() => set("kind", k)}
                  className={cn(
                    "h-8 rounded-md text-sm font-medium transition-colors",
                    values.kind === k
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="as-title">Başlık</Label>
            <Input
              id="as-title"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={values.kind === "proje" ? "ör. Dönem projesi raporu" : "ör. 3. hafta problem seti"}
              maxLength={160}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="as-course">Ders</Label>
            <NativeSelect id="as-course" value={values.course_id} onChange={(e) => set("course_id", e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="grid gap-2">
              <Label htmlFor="as-date">Son teslim</Label>
              <Input id="as-date" type="date" value={values.due_date} onChange={(e) => set("due_date", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="as-time">Saat</Label>
              <Input id="as-time" type="time" value={values.due_time} onChange={(e) => set("due_time", e.target.value)} />
            </div>
          </div>

          {assignment && (
            <div className="grid gap-2">
              <Label htmlFor="as-status">Durum</Label>
              <NativeSelect
                id="as-status"
                value={values.status}
                onChange={(e) => set("status", e.target.value as AssignmentInput["status"])}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="as-desc">
              Not <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
            </Label>
            <Textarea
              id="as-desc"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Teslim yöntemi, kaynaklar, grup arkadaşları…"
              maxLength={2000}
              rows={3}
            />
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 text-[13px] text-destructive">
              <CircleAlertIcon className="mt-px size-4 shrink-0" />
              {error}
            </p>
          )}

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={pending || !values.title.trim() || !values.course_id}>
              {pending && <Loader2Icon className="animate-spin" />}
              {assignment ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

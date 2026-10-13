"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, CircleAlertIcon, Loader2Icon, MinusIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createCourse, updateCourse, type CourseInput } from "@/app/(app)/dersler/actions";
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
import { COLOR_KEYS, COURSE_COLORS, type CourseColor } from "@/lib/colors";
import { todayISO } from "@/lib/semester";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Verilirse düzenleme modu. */
  course?: Course;
  /** Yeni derste varsayılan renk/başlangıç önerisi. */
  defaults?: Partial<Pick<Course, "color" | "start_date">>;
};

function initialState(course?: Course, defaults?: Props["defaults"]): CourseInput {
  return {
    name: course?.name ?? "",
    color: course?.color ?? defaults?.color ?? "emerald",
    start_date: course?.start_date ?? defaults?.start_date ?? todayISO(),
    week_count: course?.week_count ?? 14,
    midterm_date: course?.midterm_date ?? null,
    final_date: course?.final_date ?? null,
  };
}

export function CourseFormDialog({ open, onOpenChange, course, defaults }: Props) {
  const router = useRouter();
  const [values, setValues] = React.useState<CourseInput>(() => initialState(course, defaults));
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const isEdit = Boolean(course);

  React.useEffect(() => {
    if (open) {
      setValues(initialState(course, defaults));
      setError(null);
    }
    // Yalnızca açılışta sıfırla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof CourseInput>(key: K, v: CourseInput[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const shrinking = course && values.week_count < course.week_count;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (course) {
        const res = await updateCourse(course.id, values);
        if (!res.ok) return setError(res.error);
        toast.success("Ders güncellendi");
        onOpenChange(false);
      } else {
        const res = await createCourse(values);
        if (!res.ok) return setError(res.error);
        toast.success("Ders eklendi", { description: values.name });
        onOpenChange(false);
        router.push(`/dersler/${res.id}`);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Dersi düzenle" : "Yeni ders"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Ders bilgilerini güncelle. Haftalık veriler korunur."
              : "Haftalar dönem başlangıcına göre otomatik oluşturulur."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="course-name">Ders adı</Label>
            <Input
              id="course-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ör. Diferansiyel Denklemler"
              maxLength={80}
              autoFocus
              required
            />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-[13px] font-medium text-foreground/90">Renk</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Ders rengi">
              {COLOR_KEYS.map((key) => {
                const selected = values.color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={COURSE_COLORS[key].label}
                    title={COURSE_COLORS[key].label}
                    onClick={() => set("color", key as CourseColor)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-popover transition-[box-shadow,transform] outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring",
                      selected && "ring-2 ring-foreground/70",
                    )}
                    style={{ backgroundColor: COURSE_COLORS[key].hex }}
                  >
                    {selected && <CheckIcon className="size-4 text-white drop-shadow" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="course-start">Dönem başlangıcı</Label>
              <Input
                id="course-start"
                type="date"
                value={values.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-weeks">Hafta sayısı</Label>
              <div className="flex h-9 items-center rounded-md border border-input shadow-xs dark:bg-white/[0.02]">
                <button
                  type="button"
                  aria-label="Azalt"
                  onClick={() => set("week_count", Math.max(1, values.week_count - 1))}
                  className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MinusIcon className="size-3.5" />
                </button>
                <input
                  id="course-weeks"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={30}
                  value={values.week_count}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    set("week_count", Number.isNaN(n) ? 1 : Math.max(1, Math.min(30, n)));
                  }}
                  className="tabular h-full min-w-0 flex-1 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label="Artır"
                  onClick={() => set("week_count", Math.min(30, values.week_count + 1))}
                  className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <PlusIcon className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-midterm">
                Vize <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
              </Label>
              <Input
                id="course-midterm"
                type="date"
                value={values.midterm_date ?? ""}
                onChange={(e) => set("midterm_date", e.target.value || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-final">
                Final <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
              </Label>
              <Input
                id="course-final"
                type="date"
                value={values.final_date ?? ""}
                onChange={(e) => set("final_date", e.target.value || null)}
              />
            </div>
          </div>

          {shrinking && (
            <p className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-[13px] text-foreground/90">
              <CircleAlertIcon className="mt-px size-4 shrink-0 text-warning" />
              {values.week_count + 1}. haftadan sonraki haftalar ve konuları silinecek.
            </p>
          )}

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
            <Button type="submit" disabled={pending || !values.name.trim()}>
              {pending && <Loader2Icon className="animate-spin" />}
              {isEdit ? "Kaydet" : "Dersi ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

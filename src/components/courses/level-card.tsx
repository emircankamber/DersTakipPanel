"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { CheckIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { setWeekLevel } from "@/app/(app)/dersler/actions";
import { Slider } from "@/components/ui/slider";
import { REVIEW_THRESHOLD, levelLabel } from "@/lib/levels";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v));
  React.useEffect(() => {
    const controls = animate(mv, value, { duration: 0.35, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [mv, value]);
  return <motion.span>{rounded}</motion.span>;
}

type SaveState = "idle" | "saving" | "saved";

export function LevelCard({
  weekId,
  level,
  onLocalChange,
}: {
  weekId: string;
  level: number;
  onLocalChange: (v: number) => void;
}) {
  const [save, setSave] = React.useState<SaveState>("idle");
  const lastSaved = React.useRef(level);
  const pendingValue = React.useRef<number | null>(null);
  const debounce = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const idleTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const onLocalChangeRef = React.useRef(onLocalChange);
  onLocalChangeRef.current = onLocalChange;

  const flush = React.useCallback(() => {
    clearTimeout(debounce.current);
    const v = pendingValue.current;
    pendingValue.current = null;
    if (v === null || v === lastSaved.current) {
      setSave((s) => (s === "saving" ? "idle" : s));
      return;
    }
    const previous = lastSaved.current;
    lastSaved.current = v;
    setWeekLevel(weekId, v).then((res) => {
      if (!res.ok) {
        lastSaved.current = previous;
        onLocalChangeRef.current(previous);
        setSave("idle");
        toast.error(res.error);
        return;
      }
      if (pendingValue.current !== null) return; // daha yeni bir değer bekliyor
      setSave("saved");
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setSave("idle"), 1400);
    });
  }, [weekId]);

  // Hafta değişince ya da sayfadan çıkılırken bekleyen değeri gönder.
  React.useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
      clearTimeout(idleTimer.current);
    };
  }, [flush]);

  /** Sürükleme bitince / klavye adımında çağrılır; ardışık değişiklikleri tek kayda indirger. */
  function commit(v: number) {
    pendingValue.current = v;
    setSave("saving");
    clearTimeout(debounce.current);
    debounce.current = setTimeout(flush, 450);
  }

  const needsReview = level < REVIEW_THRESHOLD;

  return (
    <section className="rounded-xl border bg-card p-5" aria-labelledby="level-title">
      <div className="flex items-center justify-between">
        <h3 id="level-title" className="text-sm font-medium">
          Öğrenme seviyesi
        </h3>
        <AnimatePresence mode="wait">
          {save !== "idle" && (
            <motion.span
              key={save}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              {save === "saving" ? (
                <Loader2Icon className="size-3 animate-spin" />
              ) : (
                <CheckIcon className="size-3 text-brand" />
              )}
              {save === "saving" ? "Kaydediliyor" : "Kaydedildi"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="tabular text-5xl font-semibold tracking-tight">
            <AnimatedNumber value={level} />
          </span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <span
          className={cn(
            "mb-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
            level === 0
              ? "text-muted-foreground"
              : needsReview
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-brand/30 bg-brand-soft text-brand",
          )}
        >
          {levelLabel(level)}
        </span>
      </div>

      <div className="mt-6">
        <Slider
          value={[level]}
          min={0}
          max={100}
          step={5}
          onValueChange={([v]) => onLocalChange(v)}
          onValueCommit={([v]) => commit(v)}
          rangeClassName={needsReview ? "bg-warning" : "bg-brand"}
        />
        <div className="relative mt-2 h-4 text-[11px] text-muted-foreground tabular">
          <span className="absolute left-0">0</span>
          <span
            className="absolute -translate-x-1/2 text-muted-foreground/80"
            style={{ left: `${REVIEW_THRESHOLD}%` }}
          >
            {REVIEW_THRESHOLD}
          </span>
          <span className="absolute right-0">100</span>
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 border-t pt-4 text-[13px] leading-relaxed text-muted-foreground">
        <RotateCcwIcon className={cn("mt-0.5 size-3.5 shrink-0", needsReview && level > 0 && "text-warning")} />
        {level === 0
          ? "Bu haftayı çalıştıkça seviyeni güncelle."
          : needsReview
            ? `${REVIEW_THRESHOLD}'ın altındaki haftalar özet sayfasında tekrar listesine düşer.`
            : "Güzel. Bu hafta tekrar listesinde görünmeyecek."}
      </p>
    </section>
  );
}

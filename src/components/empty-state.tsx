import type { LucideIcon } from "lucide-react";

import { FadeIn } from "@/components/fade-in";
import { cn } from "@/lib/utils";

/**
 * Boş durum: ince ızgara üzerinde katmanlı ikon kartı + açıklama + eylem.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "default",
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <FadeIn
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed text-center",
        size === "default" ? "px-6 py-16 sm:py-20" : "px-4 py-10",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" />
      <div className="relative mb-5">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-6 rounded-xl border bg-card/60" />
        <div className="absolute inset-0 -translate-x-2 translate-y-1 -rotate-6 rounded-xl border bg-card/60" />
        <div className={cn("relative flex items-center justify-center rounded-xl border bg-card shadow-sm", size === "default" ? "size-14" : "size-11")}>
          <Icon className={cn("text-muted-foreground", size === "default" ? "size-6" : "size-5")} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className={cn("relative font-medium tracking-tight", size === "default" ? "text-base" : "text-sm")}>{title}</h3>
      {description && (
        <p className="relative mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </FadeIn>
  );
}

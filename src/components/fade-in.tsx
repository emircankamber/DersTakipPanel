import { cn } from "@/lib/utils";

/**
 * Yumuşak giriş animasyonu — saf CSS, JS yüklenmeden de içerik görünür.
 * prefers-reduced-motion açıksa animasyon kapanır.
 */
export function FadeIn({
  delay = 0,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { delay?: number }) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-1.5 fill-mode-both duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none",
        className,
      )}
      style={{ animationDelay: `${delay}s`, ...style }}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";

/** Yükselen haftalık çubuklar — markanın tek işareti. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("size-6", className)}
    >
      <rect x="0.5" y="0.5" width="23" height="23" rx="6.5" className="fill-foreground/[0.04] stroke-foreground/15" />
      <rect x="6" y="13" width="2.5" height="5" rx="1.25" className="fill-foreground/35" />
      <rect x="10.75" y="10" width="2.5" height="8" rx="1.25" className="fill-foreground/60" />
      <rect x="15.5" y="6" width="2.5" height="12" rx="1.25" className="fill-brand" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[22px] leading-none">Dönem</span>
    </span>
  );
}

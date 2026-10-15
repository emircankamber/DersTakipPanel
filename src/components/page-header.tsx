import { FadeIn } from "@/components/fade-in";
import { cn } from "@/lib/utils";

/**
 * Sayfa başlığı: mono "eyebrow" + büyük serif başlık + açıklama.
 * Başlık içindeki <em> italik serif vurgu olarak görünür.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <FadeIn className={cn("mb-8 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {children}
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl [&_em]:text-muted-foreground [&_em]:italic">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </FadeIn>
  );
}

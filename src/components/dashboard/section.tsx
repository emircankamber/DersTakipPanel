import { cn } from "@/lib/utils";

/** Özet kartı: başlık + isteğe bağlı sağ üst eylem + içerik. */
export function Section({
  title,
  description,
  action,
  className,
  children,
  id,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("flex min-w-0 flex-col rounded-xl border bg-card", className)}>
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h2 id={id} className="text-sm font-medium tracking-tight">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col p-5">{children}</div>
    </section>
  );
}

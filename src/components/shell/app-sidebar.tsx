"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { courseColor } from "@/lib/colors";
import { getCurrentWeek } from "@/lib/semester";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive, type NavCourse, type NavProps } from "./nav-items";
import { UserMenu } from "./user-menu";

const ACTIVE_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

/** Dönem ilerlemesi: en erken başlayan dersin takvimine göre segmentli çubuk. */
function SemesterProgress({ courses }: { courses: NavCourse[] }) {
  if (courses.length === 0) return null;
  const ref = [...courses].sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
  const info = getCurrentWeek(ref);
  const total = ref.week_count;
  const done = info.status === "upcoming" ? 0 : info.status === "finished" ? total : info.week;
  const label =
    info.status === "upcoming"
      ? `${info.daysToStart} gün sonra başlıyor`
      : info.status === "finished"
        ? "Dönem tamamlandı"
        : `${info.week}. hafta / ${total}`;

  return (
    <div className="mx-4 mb-4 rounded-xl border bg-background/40 p-4">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Dönem</span>
        <span className="font-mono text-[11px] text-muted-foreground tabular">%{Math.round((done / total) * 100)}</span>
      </div>
      <p className="mt-2 font-display text-xl leading-none">{label}</p>
      <div className="mt-4 flex gap-[3px]" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i === done - 1 && info.status === "active" ? "bg-brand" : i < done ? "bg-foreground/50" : "bg-foreground/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function AppSidebar({ email, courses }: NavProps) {
  const pathname = usePathname();

  return (
    <div className="relative z-10 hidden border-r bg-card/30 md:block">
      <aside className="sticky top-0 flex h-dvh flex-col">
        <div className="flex h-20 items-center justify-between px-6">
          <Link href="/panel" className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex flex-col gap-1 px-4" aria-label="Ana menü">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/dersler" ? pathname === "/dersler" : isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg border border-border-strong bg-card shadow-[inset_0_1px_0_var(--highlight)]"
                    transition={ACTIVE_SPRING}
                  />
                )}
                <Icon className="relative size-4" strokeWidth={1.75} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 flex min-h-0 flex-1 flex-col px-4">
          <p className="eyebrow px-3 pb-3">Derslerim</p>
          <div className="-mr-2 flex min-h-0 flex-col gap-1 overflow-y-auto pr-2">
            {courses.length === 0 && (
              <Link href="/dersler" className="px-3 text-[13px] text-muted-foreground/80 hover:text-foreground">
                İlk dersini ekle →
              </Link>
            )}
            {courses.map((c) => {
              const href = `/dersler/${c.id}`;
              const active = pathname === href;
              const info = getCurrentWeek(c);
              return (
                <Link
                  key={c.id}
                  href={href}
                  className={cn(
                    "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg border border-border-strong bg-card shadow-[inset_0_1px_0_var(--highlight)]"
                      transition={ACTIVE_SPRING}
                    />
                  )}
                  <span
                    className="relative h-4 w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: courseColor(c.color) }}
                  />
                  <span className="relative min-w-0 flex-1 truncate">{c.name}</span>
                  {info.status === "active" && (
                    <span className="relative font-mono text-[10px] text-muted-foreground/70 tabular">H{info.week}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <SemesterProgress courses={courses} />

        <div className="border-t px-4 py-3">
          <UserMenu email={email} />
        </div>
      </aside>
    </div>
  );
}

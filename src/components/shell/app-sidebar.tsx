"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { courseColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive, type NavProps } from "./nav-items";
import { UserMenu } from "./user-menu";

export function AppSidebar({ email, courses }: NavProps) {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-card/40 md:block">
      <aside className="sticky top-0 flex h-dvh flex-col">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/panel" className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex flex-col gap-0.5 px-3 pt-2" aria-label="Ana menü">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href) && !(item.href === "/dersler" && pathname !== "/dersler");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                  active ? "text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md border bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
          <p className="px-2.5 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">
            Derslerim
          </p>
          <div className="-mr-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto pr-1">
            {courses.length === 0 && (
              <p className="px-2.5 text-[13px] text-muted-foreground/70">Henüz ders yok</p>
            )}
            {courses.map((c) => {
              const href = `/dersler/${c.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={c.id}
                  href={href}
                  className={cn(
                    "relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40",
                    active ? "text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-md border bg-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span
                    className="relative size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: courseColor(c.color) }}
                  />
                  <span className="relative truncate">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t p-3">
          <UserMenu email={email} />
        </div>
      </aside>
    </div>
  );
}

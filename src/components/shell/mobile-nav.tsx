"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive, type NavProps } from "./nav-items";
import { UserMenu } from "./user-menu";

export function MobileNav({ email }: NavProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Link href="/panel">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserMenu email={email} compact />
        </div>
      </header>

      <nav
        aria-label="Alt menü"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-sm grid-cols-2 gap-1 p-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-active"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className="relative size-[18px]" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

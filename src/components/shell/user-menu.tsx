"use client";

import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";

import { signOut } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Avatar({ email, className }: { email: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted text-[11px] font-semibold uppercase text-foreground/80",
        className,
      )}
    >
      {email.slice(0, 1) || "?"}
    </span>
  );
}

export function UserMenu({ email, compact = false }: { email: string; compact?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2.5 rounded-lg text-left outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40",
          compact ? "p-1" : "w-full p-2",
        )}
        aria-label="Hesap menüsü"
      >
        <Avatar email={email} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/90">{email}</span>
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? "end" : "start"} side={compact ? "bottom" : "top"} className="w-56">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOutIcon />
              Çıkış yap
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

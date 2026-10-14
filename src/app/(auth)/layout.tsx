import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid mask-fade-b" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[480px] glow-top" />

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/giris" className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      {!isSupabaseConfigured() && (
        <div className="relative z-10 mx-auto mt-2 w-full max-w-md px-5">
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3.5 py-2.5 text-[13px] text-foreground/90">
            Önizleme modu: Supabase bağlantısı henüz yapılandırılmadı, giriş ve kayıt çalışmaz.
          </p>
        </div>
      )}

      <main className="relative z-10 flex flex-1 items-start justify-center px-5 pt-[8vh] pb-16 sm:items-center sm:pt-0">
        {children}
      </main>

      <footer className="relative z-10 px-5 pb-6 text-center text-xs text-muted-foreground sm:px-8">
        Haftalık ders takibi · verilerin yalnızca sana görünür
      </footer>
    </div>
  );
}

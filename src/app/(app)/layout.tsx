import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/shell/app-sidebar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { getUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/giris");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, color, start_date, week_count")
    .order("created_at", { ascending: true });

  const nav = { email: user.email ?? "", courses: courses ?? [] };

  return (
    <div className="noise relative min-h-dvh md:grid md:grid-cols-[264px_1fr]">
      <AppSidebar {...nav} />
      <div className="relative flex min-w-0 flex-col">
        {/* Ortam ışığı: sayfanın üstünde zümrüt tonlu, çok hafif bir parıltı */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] glow-top" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <MobileNav {...nav} />
        <main className="relative flex-1 px-4 pt-8 pb-32 sm:px-8 md:px-12 md:pt-16 md:pb-24">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

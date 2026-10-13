import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/shell/app-sidebar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { getUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/giris");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, color")
    .order("created_at", { ascending: true });

  const nav = { email: user.email ?? "", courses: courses ?? [] };

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <AppSidebar {...nav} />
      <div className="flex min-w-0 flex-col">
        <MobileNav {...nav} />
        <main className="flex-1 px-4 pt-6 pb-28 sm:px-6 md:px-10 md:pt-10 md:pb-16">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

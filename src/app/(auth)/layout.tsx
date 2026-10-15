import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Sol paneldeki ürün önizlemesi için sabit örnek seviyeler (gerçek veri değildir). */
const SAMPLE = [
  { name: "Diferansiyel Denklemler", color: "var(--course-blue)", levels: [72, 85, 64, 90, 55, 0, 0, 0, 0, 0] },
  { name: "Veri Yapıları", color: "var(--course-violet)", levels: [60, 48, 77, 81, 69, 0, 0, 0, 0, 0] },
  { name: "Olasılık", color: "var(--course-aqua)", levels: [88, 92, 70, 45, 62, 0, 0, 0, 0, 0] },
  { name: "Mikroekonomi", color: "var(--course-magenta)", levels: [35, 58, 66, 74, 80, 0, 0, 0, 0, 0] },
];
const CURRENT = 5;

function Preview() {
  return (
    <div className="surface relative p-6" aria-hidden>
      <div className="flex items-center justify-between">
        <span className="eyebrow">Ders × hafta</span>
        <span className="font-mono text-[10px] text-muted-foreground">örnek görünüm</span>
      </div>
      <div className="mt-6 grid gap-2">
        {SAMPLE.map((c) => (
          <div key={c.name} className="grid grid-cols-[112px_1fr] items-center gap-4">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="truncate text-[11px] text-muted-foreground">{c.name}</span>
            </span>
            <span className="grid grid-cols-10 gap-1">
              {c.levels.map((l, i) => (
                <span
                  key={i}
                  className={i < CURRENT ? "h-6 rounded-[4px]" : "h-6 rounded-[4px] border border-dashed border-foreground/10"}
                  style={
                    i < CURRENT
                      ? {
                          backgroundColor: `color-mix(in oklab, var(--brand) ${Math.round(18 + l * 0.82)}%, var(--muted))`,
                          boxShadow: i === CURRENT - 1 ? "0 0 0 1px var(--foreground)" : undefined,
                        }
                      : undefined
                  }
                />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Marka paneli — yalnızca geniş ekranda */}
      <aside className="noise relative hidden overflow-hidden border-r bg-card/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[560px] rounded-full glow-top opacity-80" />

        <Link href="/giris" className="relative w-fit">
          <Logo />
        </Link>

        <div className="relative max-w-lg">
          <p className="eyebrow">Haftalık ders takibi</p>
          <h2 className="mt-4 font-display text-6xl leading-[1.02] xl:text-7xl">
            Dönemin, <em className="text-muted-foreground">hafta hafta</em> elinin altında.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Her dersin konularını işaretle, haftalık öğrenme seviyeni kaydet. Zayıf kalan haftalar tekrar listesine
            düşsün; vize, final ve ödev teslimleri gözünün önünde olsun.
          </p>
          <div className="mt-12">
            <Preview />
          </div>
        </div>

        <p className="relative text-xs text-muted-foreground">Verilerin yalnızca sana görünür.</p>
      </aside>

      {/* Form paneli */}
      <div className="noise relative flex min-h-dvh flex-col lg:min-h-0">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px] glow-top lg:hidden" />
        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-8">
          <Link href="/giris" className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>

        {!configured && (
          <div className="relative z-10 mx-auto w-full max-w-sm px-6">
            <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[13px] text-foreground/90">
              Önizleme modu: Supabase bağlantısı henüz yapılandırılmadı, giriş ve kayıt çalışmaz.
            </p>
          </div>
        )}

        <main className="relative z-10 flex flex-1 items-start justify-center px-6 pt-[8vh] pb-16 sm:items-center sm:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

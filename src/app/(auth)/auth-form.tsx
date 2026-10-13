"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  MailCheckIcon,
} from "lucide-react";

import { FadeIn } from "@/components/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthState } from "./actions";

type Mode = "giris" | "kayit";

const COPY: Record<Mode, { title: string; subtitle: string; cta: string; alt: string; altLink: string; altHref: string }> = {
  giris: {
    title: "Tekrar hoş geldin",
    subtitle: "Bu haftanın derslerine kaldığın yerden devam et.",
    cta: "Giriş yap",
    alt: "Hesabın yok mu?",
    altLink: "Kayıt ol",
    altHref: "/kayit",
  },
  kayit: {
    title: "Dönemini planla",
    subtitle: "Derslerini ekle, her haftayı konu konu takip et.",
    cta: "Hesap oluştur",
    alt: "Zaten hesabın var mı?",
    altLink: "Giriş yap",
    altHref: "/giris",
  },
};

export function AuthForm({ mode, initialError }: { mode: Mode; initialError?: string }) {
  const action = mode === "giris" ? signIn : signUp;
  const [state, formAction, pending] = React.useActionState<AuthState, FormData>(
    action,
    { error: initialError },
  );
  const [showPassword, setShowPassword] = React.useState(false);
  const copy = COPY[mode];

  return (
    <FadeIn className="w-full max-w-[380px]">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {state.info ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg border bg-brand-soft text-brand">
              <MailCheckIcon className="size-5" />
            </div>
            <h2 className="font-medium">E-postanı kontrol et</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{state.info}</p>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link href="/giris">Giriş sayfasına dön</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={false}
            exit={{ opacity: 0 }}
            action={formAction}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="ad@universite.edu.tr"
                defaultValue={state.email}
                required
                autoFocus
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                {mode === "kayit" && (
                  <span className="text-xs text-muted-foreground">En az 8 karakter</span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "giris" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  required
                  minLength={mode === "kayit" ? 8 : undefined}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {state.error && (
                <motion.p
                  key={state.error}
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 overflow-hidden text-[13px] text-destructive"
                >
                  <CircleAlertIcon className="mt-px size-4 shrink-0" />
                  {state.error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" size="lg" className="group w-full" disabled={pending}>
              {pending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <>
                  {copy.cta}
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            <p className="text-center text-[13px] text-muted-foreground">
              {copy.alt}{" "}
              <Link
                href={copy.altHref}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {copy.altLink}
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </FadeIn>
  );
}

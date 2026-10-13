"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  info?: string;
  email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function translate(code: string | undefined, message: string): string {
  switch (code) {
    case "invalid_credentials":
      return "E-posta veya şifre hatalı.";
    case "email_not_confirmed":
      return "E-posta adresin henüz doğrulanmadı. Gelen kutunu kontrol et.";
    case "user_already_exists":
    case "email_exists":
      return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.";
    case "weak_password":
      return "Şifre çok zayıf. En az 8 karakter kullan.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.";
    case "signup_disabled":
      return "Yeni kayıtlar şu an kapalı.";
    default:
      return message || "Bir şeyler ters gitti. Tekrar dene.";
  }
}

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!EMAIL_RE.test(email)) return { error: "Geçerli bir e-posta gir.", email };
  if (!password) return { error: "Şifreni gir.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translate(error.code, error.message), email };

  redirect("/panel");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!EMAIL_RE.test(email)) return { error: "Geçerli bir e-posta gir.", email };
  if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı.", email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm` },
  });
  if (error) return { error: translate(error.code, error.message), email };

  // E-posta doğrulaması kapalıysa oturum hemen açılır.
  if (data.session) redirect("/panel");

  // Doğrulama açıkken var olan e-postalar için Supabase sahte kullanıcı döner (identities boş).
  if (data.user && data.user.identities?.length === 0) {
    return { error: translate("user_already_exists", ""), email };
  }

  return {
    info: `${email} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra panel açılacak.`,
    email,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/giris");
}

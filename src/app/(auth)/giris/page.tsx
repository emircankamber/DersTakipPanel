import type { Metadata } from "next";

import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Giriş" };

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;
  const initialError =
    hata === "dogrulama"
      ? "Doğrulama bağlantısı geçersiz ya da süresi dolmuş. Tekrar giriş yapmayı dene."
      : undefined;
  return <AuthForm mode="giris" initialError={initialError} />;
}

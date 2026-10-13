import type { Metadata } from "next";

import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Kayıt ol" };

export default function KayitPage() {
  return <AuthForm mode="kayit" />;
}

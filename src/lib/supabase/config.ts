/** Supabase ortam değişkenleri tanımlı mı? (Deploy'da unutulursa uygulama çökmesin.) */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const NOT_CONFIGURED_MESSAGE =
  "Supabase bağlantısı yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenlerini ekleyin.";

/**
 * Supabase proje adresi — yalnızca köken (https://xxxx.supabase.co).
 * Panelden "/rest/v1/" gibi bir yolla kopyalanırsa Auth istekleri
 * "Invalid path specified in request URL" hatası verir; yolu atıyoruz.
 */
export function supabaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

export function supabaseKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

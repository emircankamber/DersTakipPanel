/** Supabase ortam değişkenleri tanımlı mı? (Deploy'da unutulursa uygulama çökmesin.) */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const NOT_CONFIGURED_MESSAGE =
  "Supabase bağlantısı yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenlerini ekleyin.";

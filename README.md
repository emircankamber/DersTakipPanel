# Dönem — Ders Takip Paneli

Üniversite derslerini haftalık takip eden, çok kullanıcılı web paneli.
Her ders için haftalık konular ve 0–100 öğrenme seviyesi; özet sayfasında
grafikler, ısı haritası, tekrar listesi ve sınav geri sayımı.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) ·
Recharts · Framer Motion · Supabase (Auth + Postgres + RLS)

## Kurulum

### 1. Supabase projesi

1. [supabase.com](https://supabase.com) → **New project** oluşturun (bölge: Frankfurt `eu-central-1` önerilir).
2. **SQL Editor** → **New query** → [`supabase/schema.sql`](supabase/schema.sql) dosyasının tamamını yapıştırıp **Run**.
   Dosya tekrar çalıştırılabilir; şema güncellendiğinde yeniden çalıştırmanız yeterli.
3. **Authentication → Sign In / Providers → Email** açık olmalı (varsayılan olarak açıktır).
   - Hızlı deneme için **Confirm email** seçeneğini kapatabilirsiniz; kayıt olunca doğrudan panele girilir.
   - Açık bırakırsanız 4. adımdaki yönlendirme adreslerini mutlaka ekleyin.
4. **Authentication → URL Configuration**
   - **Site URL:** `http://localhost:3000` (deploy sonrası Vercel adresiniz)
   - **Redirect URLs:** `http://localhost:3000/auth/confirm` ve `https://<vercel-adresiniz>/auth/confirm`
5. **Project Settings → API** sayfasından **Project URL** ve **anon / publishable key** değerlerini kopyalayın.

### 2. Yerel ortam

```bash
cp .env.example .env.local   # değerleri doldurun
npm install
npm run dev                  # http://localhost:3000
```

| Değişken | Açıklama |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable anahtar (RLS sayesinde tarayıcıda güvenli) |
| `NEXT_PUBLIC_SITE_URL` | İsteğe bağlı. E-posta doğrulama dönüş adresinin kökü |

### 3. Vercel

1. Depoyu Vercel'e import edin (Framework: Next.js, ayar gerekmez).
2. **Environment Variables** kısmına yukarıdaki değişkenleri ekleyin
   (`NEXT_PUBLIC_SITE_URL` = Vercel üretim adresi).
3. Deploy sonrası adresi Supabase **URL Configuration** ayarına ekleyin.

## Veri modeli

| Tablo | Alanlar |
| --- | --- |
| `courses` | ad, renk, dönem başlangıcı, hafta sayısı (varsayılan 14), vize/final tarihi |
| `weeks` | ders × hafta satırı, `level` 0–100. Ders eklenince trigger ile otomatik oluşur |
| `topics` | haftaya bağlı konu, `done` işareti, sıralama |

Tüm tablolarda Row Level Security açıktır: her kullanıcı yalnızca `user_id = auth.uid()`
olan satırları görür ve değiştirebilir; alt kayıtlar (hafta/konu) yalnızca kullanıcının
kendi üst kaydına bağlanabilir.

**Şu anki hafta:** `floor((bugün − başlangıç) / 7) + 1`, Türkiye saatine göre hesaplanır ve
1…hafta sayısı aralığına sıkıştırılır. Dönem başlamadıysa "başlıyor", bittiyse "tamamlandı" gösterilir.

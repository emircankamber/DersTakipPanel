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

### 3. Ödev hatırlatma e-postaları (isteğe bağlı)

Teslim tarihinden **7, 3 ve 1 gün önce** her sabah ~09:00'da (TR) e-posta gider. Vercel Cron
(`vercel.json`) günde bir kez `/api/cron/reminders` uç noktasını çağırır; kullanıcı başına tek
e-posta gönderilir, aynı eşik ikinci kez gönderilmez.

1. Mevcut Supabase projesinde **SQL Editor**'da [`supabase/002_odevler.sql`](supabase/002_odevler.sql) dosyasını çalıştırın
   (yeni kurulumda `schema.sql` bunu zaten içerir).
2. [resend.com](https://resend.com)'da hesap açıp bir **API key** oluşturun.
   Alan adı doğrulamadan `onboarding@resend.dev` göndericisi yalnızca **Resend hesabınızın e-postasına** gönderebilir;
   başka kullanıcılara da mail gidecekse Resend'de alan adınızı doğrulayıp `REMINDER_FROM_EMAIL`'i güncelleyin.
3. Vercel → Environment Variables (yalnızca **Production**):
   `SUPABASE_SERVICE_ROLE_KEY` (Supabase *Secret key*), `RESEND_API_KEY`, `CRON_SECRET` (rastgele uzun değer),
   isteğe bağlı `REMINDER_FROM_EMAIL`. Ardından yeniden deploy edin.
4. Elle denemek için: `curl -H "Authorization: Bearer $CRON_SECRET" "https://<adres>/api/cron/reminders?dry=1"`
   (`dry=1` göndermeden kimlere ne gideceğini gösterir).

Kullanıcılar hatırlatmaları **Ödevler** sayfasındaki "E-posta hatırlatma" anahtarından kapatabilir.

### 4. Vercel

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
| `assignments` | derse bağlı ödev/proje: başlık, not, son teslim, durum (yapılacak/devam/tamamlandı) |
| `user_settings` | e-posta hatırlatma tercihi |
| `assignment_reminders` | gönderilen hatırlatma kaydı (yalnızca sunucu erişir) |

Tüm tablolarda Row Level Security açıktır: her kullanıcı yalnızca `user_id = auth.uid()`
olan satırları görür ve değiştirebilir; alt kayıtlar (hafta/konu) yalnızca kullanıcının
kendi üst kaydına bağlanabilir.

**Şu anki hafta:** `floor((bugün − başlangıç) / 7) + 1`, Türkiye saatine göre hesaplanır ve
1…hafta sayısı aralığına sıkıştırılır. Dönem başlamadıysa "başlıyor", bittiyse "tamamlandı" gösterilir.

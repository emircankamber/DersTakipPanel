import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { reminderHtml, reminderSubject, reminderText, type ReminderItem } from "@/lib/email/reminder";
import { todayISO } from "@/lib/semester";
import { supabaseUrl } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type Row = ReminderItem & { user_id: string; email: string };

function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/**
 * Günlük hatırlatma işi — Vercel Cron her sabah çağırır (vercel.json).
 * Teslime 7/3/1 gün kalan ödevler için kullanıcı başına tek e-posta gönderir.
 * ?dry=1 ile gönderim yapmadan ne gideceğini döner.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const dry = request.nextUrl.searchParams.get("dry") === "1";
  if (!serviceKey) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY tanımlı değil" }, { status: 500 });
  if (!resendKey && !dry) return NextResponse.json({ error: "RESEND_API_KEY tanımlı değil" }, { status: 500 });

  const admin = createClient(supabaseUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const today = todayISO();
  const { data, error } = await admin.rpc("pending_assignment_reminders", { p_today: today });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byUser = new Map<string, Row[]>();
  for (const row of (data ?? []) as Row[]) {
    const list = byUser.get(row.user_id) ?? [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  const site = siteUrl();
  const from = process.env.REMINDER_FROM_EMAIL || "Dönem <onboarding@resend.dev>";
  const endpoint = process.env.RESEND_API_URL || "https://api.resend.com/emails";
  const results: { email: string; items: number; ok: boolean; error?: string }[] = [];

  for (const [userId, items] of byUser) {
    const email = items[0].email;
    if (dry) {
      results.push({ email, items: items.length, ok: true });
      continue;
    }
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        // Aynı gün yeniden denemede çift e-posta gitmesin.
        "Idempotency-Key": `reminder-${today}-${userId}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: reminderSubject(items),
        html: reminderHtml(items, site),
        text: reminderText(items, site),
      }),
    });

    if (!res.ok) {
      results.push({ email, items: items.length, ok: false, error: `${res.status} ${await res.text()}`.slice(0, 300) });
      continue;
    }

    const { error: logError } = await admin
      .from("assignment_reminders")
      .upsert(
        items.map((i) => ({ assignment_id: i.assignment_id, offset_days: i.offset_days })),
        { onConflict: "assignment_id,offset_days", ignoreDuplicates: true },
      );
    results.push({ email, items: items.length, ok: !logError, error: logError?.message });
  }

  const failed = results.filter((r) => !r.ok).length;
  return NextResponse.json(
    { date: today, dry, users: results.length, sent: results.length - failed, failed, results },
    { status: failed ? 207 : 200 },
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AssignmentManager } from "@/components/assignments/assignment-manager";
import { ReminderToggle } from "@/components/assignments/reminder-toggle";
import { PageHeader } from "@/components/page-header";
import { getUser } from "@/lib/supabase/server";
import type { Assignment } from "@/lib/types";

export const metadata: Metadata = { title: "Ödevler" };

export default async function OdevlerPage() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/giris");

  const [{ data: assignments }, { data: courses }, { data: settings }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, course_id, kind, title, description, due_at, status, completed_at, created_at")
      .order("due_at"),
    supabase.from("courses").select("id, name, color").order("created_at"),
    supabase.from("user_settings").select("email_reminders").maybeSingle(),
  ]);

  return (
    <>
      <PageHeader title="Ödevler" description="Ödev ve projelerini derslere göre takip et, teslim tarihlerini kaçırma." />
      <AssignmentManager
        initial={(assignments ?? []) as Assignment[]}
        courses={courses ?? []}
        filters
        title="Tüm ödev ve projeler"
        toolbar={<ReminderToggle initial={settings?.email_reminders ?? true} email={user.email ?? ""} />}
      />
    </>
  );
}

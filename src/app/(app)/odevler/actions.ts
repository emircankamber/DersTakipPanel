"use server";

import { revalidatePath } from "next/cache";

import { toDueAt } from "@/lib/assignments";
import { isValidISODate } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Assignment, AssignmentKind, AssignmentStatus } from "@/lib/types";

export type AssignmentInput = {
  course_id: string;
  kind: AssignmentKind;
  title: string;
  description: string;
  due_date: string; // YYYY-MM-DD
  due_time: string; // HH:mm
  status: AssignmentStatus;
};

const KINDS: AssignmentKind[] = ["odev", "proje"];
const STATUSES: AssignmentStatus[] = ["todo", "in_progress", "done"];
const SELECT = "id, course_id, kind, title, description, due_at, status, completed_at, created_at";

function validate(input: AssignmentInput): string | null {
  if (!input.course_id) return "Bir ders seç.";
  if (!KINDS.includes(input.kind)) return "Geçersiz tür.";
  const title = input.title?.trim() ?? "";
  if (!title) return "Başlık boş olamaz.";
  if (title.length > 160) return "Başlık en fazla 160 karakter olabilir.";
  if ((input.description ?? "").length > 2000) return "Açıklama en fazla 2000 karakter olabilir.";
  if (!isValidISODate(input.due_date)) return "Teslim tarihini seç.";
  if (input.due_time && !/^\d{2}:\d{2}$/.test(input.due_time)) return "Saat geçersiz.";
  if (!STATUSES.includes(input.status)) return "Geçersiz durum.";
  return null;
}

function toRow(input: AssignmentInput) {
  return {
    course_id: input.course_id,
    kind: input.kind,
    title: input.title.trim(),
    description: input.description.trim() || null,
    due_at: toDueAt(input.due_date, input.due_time),
    status: input.status,
  };
}

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createAssignment(
  input: AssignmentInput,
): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };
  const supabase = await createClient();
  const { data, error } = await supabase.from("assignments").insert(toRow(input)).select(SELECT).single();
  if (error) return { ok: false, error: "Kaydedilemedi. Tekrar dene." };
  revalidate();
  return { ok: true, assignment: data as Assignment };
}

export async function updateAssignment(
  id: string,
  input: AssignmentInput,
): Promise<{ ok: true; assignment: Assignment } | { ok: false; error: string }> {
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };
  const supabase = await createClient();
  const { data, error } = await supabase.from("assignments").update(toRow(input)).eq("id", id).select(SELECT).single();
  if (error) return { ok: false, error: "Güncellenemedi. Tekrar dene." };
  revalidate();
  return { ok: true, assignment: data as Assignment };
}

export async function setAssignmentStatus(id: string, status: AssignmentStatus): Promise<ActionResult> {
  if (!STATUSES.includes(status)) return { ok: false, error: "Geçersiz durum." };
  const supabase = await createClient();
  const { error } = await supabase.from("assignments").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "Durum güncellenemedi." };
  revalidate();
  return { ok: true };
}

export async function deleteAssignment(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return { ok: false, error: "Silinemedi." };
  revalidate();
  return { ok: true };
}

export async function setEmailReminders(enabled: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, email_reminders: enabled, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: "Tercih kaydedilemedi." };
  revalidatePath("/odevler");
  return { ok: true };
}

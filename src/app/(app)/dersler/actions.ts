"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isCourseColor } from "@/lib/colors";
import { clampLevel } from "@/lib/levels";
import { isValidISODate } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Topic } from "@/lib/types";

export type CourseInput = {
  name: string;
  color: string;
  start_date: string;
  week_count: number;
  midterm_date: string | null;
  final_date: string | null;
};

function validateCourse(input: CourseInput): string | null {
  const name = input.name?.trim() ?? "";
  if (!name) return "Ders adı boş olamaz.";
  if (name.length > 80) return "Ders adı en fazla 80 karakter olabilir.";
  if (!isCourseColor(input.color)) return "Geçersiz renk.";
  if (!isValidISODate(input.start_date)) return "Dönem başlangıç tarihini seç.";
  if (!Number.isInteger(input.week_count) || input.week_count < 1 || input.week_count > 30)
    return "Hafta sayısı 1 ile 30 arasında olmalı.";
  for (const [label, d] of [["Vize", input.midterm_date], ["Final", input.final_date]] as const) {
    if (d !== null && !isValidISODate(d)) return `${label} tarihi geçersiz.`;
  }
  if (input.midterm_date && input.final_date && input.final_date < input.midterm_date)
    return "Final tarihi vizeden önce olamaz.";
  return null;
}

function normalize(input: CourseInput) {
  return {
    name: input.name.trim(),
    color: input.color,
    start_date: input.start_date,
    week_count: input.week_count,
    midterm_date: input.midterm_date || null,
    final_date: input.final_date || null,
  };
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createCourse(
  input: CourseInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const invalid = validateCourse(input);
  if (invalid) return { ok: false, error: invalid };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert(normalize(input))
    .select("id")
    .single();
  if (error) return { ok: false, error: "Ders eklenemedi. Tekrar dene." };

  revalidateAll();
  return { ok: true, id: data.id };
}

export async function updateCourse(id: string, input: CourseInput): Promise<ActionResult> {
  const invalid = validateCourse(input);
  if (invalid) return { ok: false, error: invalid };

  const supabase = await createClient();
  const { error } = await supabase.from("courses").update(normalize(input)).eq("id", id);
  if (error) return { ok: false, error: "Ders güncellenemedi. Tekrar dene." };

  revalidateAll();
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { ok: false, error: "Ders silinemedi. Tekrar dene." };

  revalidateAll();
  redirect("/dersler");
}

export async function setWeekLevel(weekId: string, level: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("weeks")
    .update({ level: clampLevel(level) })
    .eq("id", weekId);
  if (error) return { ok: false, error: "Seviye kaydedilemedi." };

  revalidatePath("/panel");
  return { ok: true };
}

export async function addTopic(
  weekId: string,
  title: string,
  position: number,
): Promise<{ ok: true; topic: Topic } | { ok: false; error: string }> {
  const clean = title.trim();
  if (!clean) return { ok: false, error: "Konu adı boş olamaz." };
  if (clean.length > 200) return { ok: false, error: "Konu en fazla 200 karakter olabilir." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .insert({ week_id: weekId, title: clean, position })
    .select("id, week_id, title, done, position, created_at")
    .single();
  if (error) return { ok: false, error: "Konu eklenemedi." };

  revalidatePath("/panel");
  return { ok: true, topic: data as Topic };
}

export async function toggleTopic(id: string, done: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("topics").update({ done }).eq("id", id);
  if (error) return { ok: false, error: "Konu güncellenemedi." };

  revalidatePath("/panel");
  return { ok: true };
}

export async function renameTopic(id: string, title: string): Promise<ActionResult> {
  const clean = title.trim();
  if (!clean) return { ok: false, error: "Konu adı boş olamaz." };
  if (clean.length > 200) return { ok: false, error: "Konu en fazla 200 karakter olabilir." };

  const supabase = await createClient();
  const { error } = await supabase.from("topics").update({ title: clean }).eq("id", id);
  if (error) return { ok: false, error: "Konu güncellenemedi." };
  return { ok: true };
}

export async function deleteTopic(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) return { ok: false, error: "Konu silinemedi." };

  revalidatePath("/panel");
  return { ok: true };
}

-- =====================================================================
-- Ders Takip Paneli — Supabase şeması
-- Supabase Dashboard → SQL Editor'a yapıştırıp tek seferde çalıştırın.
-- Tekrar çalıştırılabilir (idempotent) şekilde yazılmıştır.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tablolar
-- ---------------------------------------------------------------------

create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name          text not null check (char_length(trim(name)) between 1 and 80),
  color         text not null default 'blue',
  start_date    date not null,
  week_count    smallint not null default 14 check (week_count between 1 and 30),
  midterm_date  date,
  final_date    date,
  created_at    timestamptz not null default now()
);

create table if not exists public.weeks (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_number  smallint not null check (week_number >= 1),
  level        smallint not null default 0 check (level between 0 and 100),
  updated_at   timestamptz not null default now(),
  unique (course_id, week_number)
);

create table if not exists public.topics (
  id          uuid primary key default gen_random_uuid(),
  week_id     uuid not null references public.weeks (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(trim(title)) between 1 and 200),
  done        boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists courses_user_idx on public.courses (user_id);
create index if not exists weeks_user_idx   on public.weeks (user_id);
create index if not exists weeks_course_idx on public.weeks (course_id);
create index if not exists topics_user_idx  on public.topics (user_id);
create index if not exists topics_week_idx  on public.topics (week_id);

-- ---------------------------------------------------------------------
-- Hafta satırlarını ders ile senkron tut
-- Ders eklendiğinde 1..week_count haftaları oluşur; hafta sayısı
-- düşürülürse fazla haftalar (ve konuları) silinir.
-- ---------------------------------------------------------------------

create or replace function public.sync_course_weeks()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.weeks (course_id, user_id, week_number)
  select new.id, new.user_id, gs
  from generate_series(1, new.week_count) as gs
  on conflict (course_id, week_number) do nothing;

  delete from public.weeks
  where course_id = new.id and week_number > new.week_count;

  return new;
end;
$$;

drop trigger if exists courses_sync_weeks on public.courses;
create trigger courses_sync_weeks
  after insert or update of week_count on public.courses
  for each row execute function public.sync_course_weeks();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists weeks_touch on public.weeks;
create trigger weeks_touch
  before update on public.weeks
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security: herkes yalnızca kendi verisini görür/değiştirir
-- ---------------------------------------------------------------------

alter table public.courses enable row level security;
alter table public.weeks   enable row level security;
alter table public.topics  enable row level security;

-- courses
drop policy if exists "courses_select_own" on public.courses;
drop policy if exists "courses_insert_own" on public.courses;
drop policy if exists "courses_update_own" on public.courses;
drop policy if exists "courses_delete_own" on public.courses;

create policy "courses_select_own" on public.courses
  for select to authenticated using (user_id = (select auth.uid()));
create policy "courses_insert_own" on public.courses
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "courses_update_own" on public.courses
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "courses_delete_own" on public.courses
  for delete to authenticated using (user_id = (select auth.uid()));

-- weeks (üst dersin de kullanıcıya ait olması zorunlu)
drop policy if exists "weeks_select_own" on public.weeks;
drop policy if exists "weeks_insert_own" on public.weeks;
drop policy if exists "weeks_update_own" on public.weeks;
drop policy if exists "weeks_delete_own" on public.weeks;

create policy "weeks_select_own" on public.weeks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "weeks_insert_own" on public.weeks
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.courses c
                where c.id = course_id and c.user_id = (select auth.uid()))
  );
create policy "weeks_update_own" on public.weeks
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.courses c
                where c.id = course_id and c.user_id = (select auth.uid()))
  );
create policy "weeks_delete_own" on public.weeks
  for delete to authenticated using (user_id = (select auth.uid()));

-- topics (üst haftanın da kullanıcıya ait olması zorunlu)
drop policy if exists "topics_select_own" on public.topics;
drop policy if exists "topics_insert_own" on public.topics;
drop policy if exists "topics_update_own" on public.topics;
drop policy if exists "topics_delete_own" on public.topics;

create policy "topics_select_own" on public.topics
  for select to authenticated using (user_id = (select auth.uid()));
create policy "topics_insert_own" on public.topics
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.weeks w
                where w.id = week_id and w.user_id = (select auth.uid()))
  );
create policy "topics_update_own" on public.topics
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.weeks w
                where w.id = week_id and w.user_id = (select auth.uid()))
  );
create policy "topics_delete_own" on public.topics
  for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.courses, public.weeks, public.topics to authenticated;

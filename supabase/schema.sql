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

-- =====================================================================
-- Ödev & proje takibi + e-posta hatırlatmaları (002_odevler.sql ile aynı)
-- =====================================================================

create table if not exists public.assignments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id    uuid not null references public.courses (id) on delete cascade,
  kind         text not null default 'odev' check (kind in ('odev', 'proje')),
  title        text not null check (char_length(trim(title)) between 1 and 160),
  description  text check (description is null or char_length(description) <= 2000),
  due_at       timestamptz not null,
  status       text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists assignments_user_idx   on public.assignments (user_id);
create index if not exists assignments_course_idx on public.assignments (course_id);
create index if not exists assignments_due_idx    on public.assignments (due_at) where status <> 'done';

-- Kullanıcı tercihleri (şimdilik yalnızca e-posta hatırlatmaları)
create table if not exists public.user_settings (
  user_id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  email_reminders boolean not null default true,
  updated_at      timestamptz not null default now()
);

-- Gönderilen hatırlatmaların kaydı: aynı ödev için aynı eşikte ikinci e-posta gitmez.
create table if not exists public.assignment_reminders (
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  offset_days   smallint not null check (offset_days in (1, 3, 7)),
  sent_at       timestamptz not null default now(),
  primary key (assignment_id, offset_days)
);

-- Teslim tarihi değişirse eski hatırlatma kayıtlarını sıfırla; tamamlanınca zaman damgası bas.
create or replace function public.assignments_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.due_at is distinct from old.due_at then
    delete from public.assignment_reminders where assignment_id = new.id;
  end if;
  if new.status = 'done' and old.status <> 'done' then
    new.completed_at = now();
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists assignments_before_update on public.assignments;
create trigger assignments_before_update
  before update on public.assignments
  for each row execute function public.assignments_before_update();

-- RLS
alter table public.assignments          enable row level security;
alter table public.user_settings        enable row level security;
alter table public.assignment_reminders enable row level security; -- politika yok: yalnızca service_role

drop policy if exists "assignments_select_own" on public.assignments;
drop policy if exists "assignments_insert_own" on public.assignments;
drop policy if exists "assignments_update_own" on public.assignments;
drop policy if exists "assignments_delete_own" on public.assignments;

create policy "assignments_select_own" on public.assignments
  for select to authenticated using (user_id = (select auth.uid()));
create policy "assignments_insert_own" on public.assignments
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.courses c
                where c.id = course_id and c.user_id = (select auth.uid()))
  );
create policy "assignments_update_own" on public.assignments
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.courses c
                where c.id = course_id and c.user_id = (select auth.uid()))
  );
create policy "assignments_delete_own" on public.assignments
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;

create policy "user_settings_select_own" on public.user_settings
  for select to authenticated using (user_id = (select auth.uid()));
create policy "user_settings_insert_own" on public.user_settings
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "user_settings_update_own" on public.user_settings
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.assignments to authenticated;
grant select, insert, update on public.user_settings to authenticated;
grant select, insert, delete on public.assignment_reminders to service_role;

-- ---------------------------------------------------------------------
-- Hatırlatma adayları (yalnızca sunucudaki cron, service_role ile çağırır)
-- Teslime 1..7 gün kalan, tamamlanmamış ödevler için bugün gönderilecek
-- en küçük eşik (1/3/7) seçilir; o eşik daha önce gönderildiyse atlanır.
-- Böylece cron bir gün kaçırılsa bile hatırlatma kaybolmaz.
-- ---------------------------------------------------------------------
create or replace function public.pending_assignment_reminders(p_today date)
returns table (
  assignment_id uuid,
  user_id       uuid,
  email         text,
  title         text,
  kind          text,
  due_at        timestamptz,
  course_name   text,
  course_color  text,
  days_left     int,
  offset_days   smallint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  with candidates as (
    select a.id, a.user_id, a.title, a.kind, a.due_at,
           c.name as course_name, c.color as course_color,
           ((a.due_at at time zone 'Europe/Istanbul')::date - p_today) as days_left
    from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.status <> 'done'
  ), with_offset as (
    select cand.*,
           (case when cand.days_left <= 1 then 1
                 when cand.days_left <= 3 then 3
                 else 7 end)::smallint as offset_days
    from candidates cand
    where cand.days_left between 1 and 7
  )
  select w.id, w.user_id, u.email::text, w.title, w.kind, w.due_at,
         w.course_name, w.course_color, w.days_left, w.offset_days
  from with_offset w
  join auth.users u on u.id = w.user_id
  left join public.user_settings s on s.user_id = w.user_id
  where coalesce(s.email_reminders, true)
    and u.email is not null
    and not exists (
      select 1 from public.assignment_reminders r
      where r.assignment_id = w.id and r.offset_days = w.offset_days
    )
  order by u.email, w.due_at;
$$;

revoke all on function public.pending_assignment_reminders(date) from public, anon, authenticated;
grant execute on function public.pending_assignment_reminders(date) to service_role;

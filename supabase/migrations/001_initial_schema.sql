-- SCHOLAR's-LINK / BENBRIDGE INT.
-- Run this migration in the Supabase SQL editor.
-- Passwords belong to Supabase Auth and are intentionally not stored here.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'teacher', 'accountant', 'parent', 'student');
create type public.account_status as enum ('Active', 'Inactive');
create type public.attendance_status as enum ('Present', 'Absent', 'Late', 'Excused');
create type public.payment_status as enum ('Pending', 'Verified', 'Rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  identity_id text not null unique,
  full_name text not null,
  email text unique,
  role public.app_role not null,
  status public.account_status not null default 'Active',
  class_name text,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  subjects text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.class_teachers (
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (class_id, teacher_id)
);

create table public.parent_wards (
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id),
  check (parent_id <> student_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id),
  attendance_date date not null,
  status public.attendance_status not null,
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id),
  subject text not null,
  ca numeric(5,2) not null check (ca >= 0 and ca <= 30),
  exam numeric(5,2) not null check (exam >= 0 and exam <= 70),
  term text not null,
  created_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  instructions text not null,
  file_name text,
  file_url text,
  due_date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  response text not null,
  file_name text,
  file_url text,
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create table public.assignment_marks (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  marked_by uuid not null references public.profiles(id),
  mark numeric(5,2) not null check (mark >= 0 and mark <= 100),
  weighted_sba numeric(5,2) generated always as (mark * 0.30) stored,
  created_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create table public.fee_charges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  term text not null,
  amount numeric(12,2) not null check (amount > 0),
  due_date date,
  created_at timestamptz not null default now(),
  unique (student_id, term)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  charge_id uuid not null references public.fee_charges(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  recorded_by uuid not null references public.profiles(id),
  amount numeric(12,2) not null check (amount > 0),
  reference text not null unique,
  status public.payment_status not null default 'Pending',
  paid_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_by uuid not null references public.profiles(id),
  published_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index attendance_student_date_idx on public.attendance(student_id, attendance_date desc);
create index scores_student_term_idx on public.scores(student_id, term);
create index assignments_class_due_idx on public.assignments(class_id, due_date);
create index submissions_student_idx on public.submissions(student_id, submitted_at desc);
create index assignment_marks_student_idx on public.assignment_marks(student_id, created_at desc);
create index payments_student_date_idx on public.payments(student_id, paid_at desc);
create index announcements_date_idx on public.announcements(published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and status = 'Active' limit 1;
$$;

create or replace function public.is_admin_or_accountant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('admin', 'accountant');
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_teachers enable row level security;
alter table public.parent_wards enable row level security;
alter table public.attendance enable row level security;
alter table public.scores enable row level security;
alter table public.fee_charges enable row level security;
alter table public.payments enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

create policy "active users view permitted profiles"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.current_role() in ('admin', 'accountant', 'teacher')
  or (public.current_role() = 'parent' and exists (select 1 from public.parent_wards w where w.parent_id = auth.uid() and w.student_id = profiles.id))
);

create policy "admins manage profiles"
on public.profiles for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "users view classes"
on public.classes for select to authenticated
using (public.current_role() is not null);

create policy "users view subjects"
on public.subjects for select to authenticated
using (public.current_role() is not null);

create policy "admins manage subjects"
on public.subjects for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "admins manage classes"
on public.classes for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "users view class teachers"
on public.class_teachers for select to authenticated
using (public.current_role() is not null);

create policy "admins manage class teachers"
on public.class_teachers for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "users view permitted wards"
on public.parent_wards for select to authenticated
using (parent_id = auth.uid() or student_id = auth.uid() or public.current_role() = 'admin');

create policy "admins manage wards"
on public.parent_wards for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "view permitted attendance"
on public.attendance for select to authenticated
using (
  student_id = auth.uid()
  or public.current_role() in ('admin', 'accountant')
  or (public.current_role() = 'parent' and exists (select 1 from public.parent_wards w where w.parent_id = auth.uid() and w.student_id = attendance.student_id))
  or (public.current_role() = 'teacher' and exists (select 1 from public.class_teachers ct join public.classes c on c.id = ct.class_id join public.profiles s on s.class_name = c.name where ct.teacher_id = auth.uid() and s.id = attendance.student_id))
);

create policy "teachers record attendance"
on public.attendance for insert to authenticated
with check (public.current_role() = 'teacher' and recorded_by = auth.uid());

create policy "view permitted scores"
on public.scores for select to authenticated
using (
  student_id = auth.uid()
  or public.current_role() in ('admin', 'accountant')
  or (public.current_role() = 'parent' and exists (select 1 from public.parent_wards w where w.parent_id = auth.uid() and w.student_id = scores.student_id))
  or (public.current_role() = 'teacher' and recorded_by = auth.uid())
);

create policy "teachers record scores"
on public.scores for insert to authenticated
with check (public.current_role() = 'teacher' and recorded_by = auth.uid());

create policy "users view permitted assignments"
on public.assignments for select to authenticated
using (
  public.current_role() in ('admin', 'accountant')
  or (public.current_role() = 'teacher' and created_by = auth.uid())
  or (public.current_role() = 'student' and exists (select 1 from public.profiles s join public.classes c on c.name = s.class_name where s.id = auth.uid() and c.id = assignments.class_id))
);

create policy "teachers and admins manage assignments"
on public.assignments for all to authenticated
using (public.current_role() = 'admin' or (public.current_role() = 'teacher' and created_by = auth.uid()))
with check (public.current_role() = 'admin' or (public.current_role() = 'teacher' and created_by = auth.uid()));

create policy "users view permitted submissions"
on public.submissions for select to authenticated
using (
  student_id = auth.uid()
  or public.current_role() = 'admin'
  or (public.current_role() = 'teacher' and exists (select 1 from public.assignments a where a.id = submissions.assignment_id and a.created_by = auth.uid()))
);

create policy "students submit own work"
on public.submissions for insert to authenticated
with check (public.current_role() = 'student' and student_id = auth.uid());

create policy "teachers view assignment marks"
on public.assignment_marks for select to authenticated
using (
  student_id = auth.uid()
  or public.current_role() = 'admin'
  or (public.current_role() = 'teacher' and exists (select 1 from public.assignments a where a.id = assignment_marks.assignment_id and a.created_by = auth.uid()))
);

create policy "teachers manage assignment marks"
on public.assignment_marks for all to authenticated
using (public.current_role() = 'teacher' and marked_by = auth.uid())
with check (public.current_role() = 'teacher' and marked_by = auth.uid());

create policy "view permitted fee charges"
on public.fee_charges for select to authenticated
using (
  student_id = auth.uid()
  or public.is_admin_or_accountant()
  or (public.current_role() = 'parent' and exists (select 1 from public.parent_wards w where w.parent_id = auth.uid() and w.student_id = fee_charges.student_id))
);

create policy "finance manages fee charges"
on public.fee_charges for all to authenticated
using (public.is_admin_or_accountant())
with check (public.is_admin_or_accountant());

create policy "view permitted payments"
on public.payments for select to authenticated
using (
  student_id = auth.uid()
  or public.is_admin_or_accountant()
  or (public.current_role() = 'parent' and exists (select 1 from public.parent_wards w where w.parent_id = auth.uid() and w.student_id = payments.student_id))
);

create policy "finance records payments"
on public.payments for insert to authenticated
with check (public.is_admin_or_accountant() and recorded_by = auth.uid());

create policy "authenticated users view announcements"
on public.announcements for select to authenticated
using (public.current_role() is not null);

create policy "admins and teachers publish announcements"
on public.announcements for insert to authenticated
with check (public.current_role() in ('admin', 'teacher') and published_by = auth.uid());

create policy "admins view audit logs"
on public.audit_logs for select to authenticated
using (public.current_role() = 'admin');

create policy "authenticated users write own audit logs"
on public.audit_logs for insert to authenticated
with check (actor_id = auth.uid());

-- New Auth users need a matching profile row. Create profiles from the
-- Supabase Auth dashboard or an Edge Function using the service role key.

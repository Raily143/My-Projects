create table if not exists public.join_us_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone_country_code text not null,
  phone_local text not null,
  gender text not null,
  age integer not null,
  position text not null,
  country text not null,
  address text not null,
  cv_file_name text not null,
  application_status text not null default 'pending' check (application_status in ('pending', 'hired', 'rejected')),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.join_us_applications enable row level security;

drop policy if exists "Allow anon insert join applications" on public.join_us_applications;
create policy "Allow anon insert join applications"
on public.join_us_applications
for insert
to anon
with check (true);

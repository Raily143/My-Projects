create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  username_norm text not null unique,
  email text not null unique,
  email_norm text not null unique,
  display_name text not null default 'Admin',
  role text not null default 'Admin',
  avatar_url text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_profiles_username_norm_idx
  on public.admin_profiles (username_norm);

create index if not exists admin_profiles_email_norm_idx
  on public.admin_profiles (email_norm);

insert into public.admin_profiles (
  username,
  username_norm,
  email,
  email_norm,
  display_name,
  role,
  avatar_url,
  password_hash
)
values (
  'admin123',
  'admin123',
  'admin@lifewood.com',
  'admin@lifewood.com',
  'Admin',
  'Admin',
  '',
  encode(digest('admin123', 'sha256'), 'hex')
)
on conflict (username_norm) do nothing;

alter table public.admin_profiles enable row level security;

drop policy if exists "Allow anon read admin profiles" on public.admin_profiles;
create policy "Allow anon read admin profiles"
on public.admin_profiles
for select
to anon
using (true);

drop policy if exists "Allow anon insert admin profiles" on public.admin_profiles;
create policy "Allow anon insert admin profiles"
on public.admin_profiles
for insert
to anon
with check (true);

drop policy if exists "Allow anon update admin profiles" on public.admin_profiles;
create policy "Allow anon update admin profiles"
on public.admin_profiles
for update
to anon
using (true)
with check (true);

create extension if not exists pgcrypto;

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  categories text[] not null default '{}',
  tags text[] not null default '{}',
  sub_tags text[] not null default '{}',
  eligibility text not null default '',
  hours text not null default '',
  contact_phone text,
  contact_email text,
  contact_website text,
  location text not null default '',
  coordinates jsonb,
  featured boolean not null default false,
  urgency smallint not null default 3 check (urgency between 1 and 3),
  status text not null default 'approved' check (status in ('approved', 'pending', 'returned')),
  return_comment text,
  tips text[] not null default '{}',
  call_script text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

 drop trigger if exists set_resources_updated_at on public.resources;
create trigger set_resources_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

alter table public.resources enable row level security;

create policy "Approved resources are readable by everyone"
on public.resources
for select
to anon, authenticated
using (status = 'approved');

-- Create users table for team management
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  image text,
  role text default 'Member', -- Admin, Creator, Member
  provider text, -- google, email, etc.
  provider_id text, -- OAuth provider user ID
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_sign_in_at timestamptz
);

-- Create index for faster lookups
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_provider_id on public.users (provider_id);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Create policy to allow authenticated users to read all users
create policy "Allow authenticated users to read users"
  on public.users
  for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- Create policy to allow users to update their own record
create policy "Allow users to update own record"
  on public.users
  for update
  using (auth.uid()::text = id::text);

-- Create trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();


-- Drop existing conflicting policies if they exist
drop policy if exists "Allow users to update own record" on public.users;
drop policy if exists "Allow authenticated users to read users" on public.users;
drop policy if exists "Allow all authenticated to read users" on public.users;
drop policy if exists "Service role can insert users" on public.users;
drop policy if exists "Service role can update users" on public.users;
drop policy if exists "Service role can delete users" on public.users;

-- Re-create read policy that works for both authenticated and service role
create policy "Allow all authenticated to read users"
  on public.users
  for select
  to authenticated, anon, service_role
  using (true);

-- Allow service role full access for insert
create policy "Service role can insert users"
  on public.users
  for insert
  to service_role
  with check (true);

-- Allow service role full access for update
create policy "Service role can update users"
  on public.users
  for update
  to service_role
  using (true);

-- Allow service role full access for delete
create policy "Service role can delete users"
  on public.users
  for delete
  to service_role
  using (true);


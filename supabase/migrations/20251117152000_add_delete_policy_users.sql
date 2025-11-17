-- Add delete policy for users table
-- Allow service role (API) to delete users
create policy "Allow service role to delete users"
  on public.users
  for delete
  using (true);

-- Add insert policy for service role (API) to create users
create policy "Allow service role to insert users"
  on public.users
  for insert
  with check (true);

-- Add update policy for service role (API) to update any user
create policy "Allow service role to update users"
  on public.users
  for update
  using (true);


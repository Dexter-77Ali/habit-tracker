-- Single JSONB table: each localStorage key becomes a row per user
create table public.user_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now() not null,
  unique(user_id, key)
);

-- Row Level Security: users only see their own data
alter table public.user_data enable row level security;

create policy "Users read own data" on public.user_data
  for select using (auth.uid() = user_id);

create policy "Users insert own data" on public.user_data
  for insert with check (auth.uid() = user_id);

create policy "Users update own data" on public.user_data
  for update using (auth.uid() = user_id);

create policy "Users delete own data" on public.user_data
  for delete using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.user_data;

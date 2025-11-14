-- Chats table
create table if not exists public.chats (
  id uuid primary key default uuid_generate_v4(),
  chat_id text unique not null,
  session_id text not null,
  user_id text,
  location text,
  user_agent text,
  status text default 'active' check (status in ('active', 'completed', 'abandoned')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id text references public.chats(chat_id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Analytics table
create table if not exists public.chat_analytics (
  id uuid primary key default uuid_generate_v4(),
  chat_id text references public.chats(chat_id) on delete cascade,
  topic_summary text,
  intent text,
  user_satisfaction int,
  sentiment text,
  metadata jsonb default '{}'::jsonb,
  computed_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_chats_created_at on public.chats (created_at desc);
create index if not exists idx_chats_session_id on public.chats (session_id);
create index if not exists idx_chats_status on public.chats (status);
create index if not exists idx_messages_chat_id on public.messages (chat_id);
create index if not exists idx_messages_created_at on public.messages (created_at desc);
create index if not exists idx_chat_analytics_chat_id on public.chat_analytics (chat_id);

-- Helpful view for admin dashboard
create or replace view public.chats_with_counts as
select 
  c.*,
  count(m.id) as message_count,
  max(m.created_at) as last_message_at
from public.chats c
left join public.messages m on m.chat_id = c.chat_id
group by c.id;


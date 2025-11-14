# CRM ↔ Concierge Integration Guide

## Overview

Horizon Concierge sends chat activity to the Horizon CRM application through
authenticated API calls. Horizon CRM persists the activity in Supabase, and the
admin UI reads directly from the same tables—so chats appear in `/admin/chats`
as soon as they are logged.

```
Concierge (Next.js) -> /api/search
   └─ server-side request  --->  CRM (/api/chats/*)
                                    └─ Supabase (chats, messages, analytics)
```

## Environment Variables

### CRM (`horizon-crm/.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
CRM_API_KEY=replace-with-long-random-string
```

Deploy the same values to Vercel (`vercel env add ...`).

### Concierge (`horizon-concierge/.env`)

```
CRM_API_URL=https://your-crm-app.vercel.app/api   # defaults to http://localhost:3001/api
CRM_API_KEY=<same as CRM>
```

No `NEXT_PUBLIC_` prefix is required because the keys are only used in
server-side API routes.

## Supabase Schema

```sql
create extension if not exists "uuid-ossp";

create table if not exists chats (
  id uuid primary key default uuid_generate_v4(),
  chat_id text unique not null,
  session_id text not null,
  external_user_id text,
  location text,
  user_agent text,
  status text default 'active',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id text references chats(chat_id) on delete cascade,
  role text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamptz default now()
);

create index if not exists idx_chats_created_at on chats(created_at desc);
create index if not exists idx_messages_chat_id on messages(chat_id);
```

Additional analytics tables can be layered on later (e.g., `chat_analytics` for
intent, sentiment, etc.).

## CRM API Contract

### `POST /api/chats/create`

```jsonc
{
  "sessionId": "session-123",       // required
  "chatId": "chat_abc",             // optional (auto-generated if omitted)
  "location": "Fort Myers, FL",
  "userAgent": "Mozilla/5.0 ...",
  "status": "active",
  "metadata": { "traveller": "Family" },
  "externalUserId": "user_42"
}
```

Returns `{ "success": true, "chatId": "chat_..." }`.

### `POST /api/chats/message`

```jsonc
{
  "chatId": "chat_abc",             // required
  "role": "user",                   // "user" | "assistant" | "system"
  "content": "Message text",        // required
  "metadata": { "source": "concierge" },
  "timestamp": "ISO timestamp"      // optional, defaults to now()
}
```

Returns `{ "success": true }`.

Both endpoints require the `x-api-key: CRM_API_KEY` header. Missing or invalid
keys result in `401 Unauthorized`.

## Concierge Implementation

- All browser interactions still hit `/api/search` (same origin, no CORS).
- `/api/search` uses `crmClient` (`lib/crm-client.ts`) to talk to CRM.
- The API key never leaves the server—users and client bundles never see it.
- If the CRM is offline or the key is missing, the concierge logs a warning but
  still responds to the user (graceful degradation).

## Testing Locally

1. Run Supabase locally or point to the hosted project.
2. Start CRM (`npm run dev -- --port 3001`) with `.env.local` populated.
3. Start Concierge (`npm run dev`) with `.env` containing the matching `CRM_API_KEY`.
4. Use the concierge UI; chats will show up in `http://localhost:3001/admin/chats`.

## Next Steps

- Add additional endpoints (e.g., `/api/chats/complete`) as product needs evolve.
- Build a UI inside CRM to rotate/regenerate API keys.
- Enrich `chat_analytics` with OpenAI/Groq powered summaries and tagging.


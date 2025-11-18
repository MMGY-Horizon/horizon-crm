# Multi-Tenancy Migration Guide

## Overview

This document outlines the changes needed to implement full multi-tenancy in the Horizon CRM system. Currently, all data is shared globally. After this migration, each organization will only see their own data.

## Database Changes

### Migration File
`supabase/migrations/20251118_add_organization_multi_tenancy.sql`

This migration adds `organization_id` to all data tables:
- `users` - Links users to organizations
- `chats` - Scopes conversations to organizations
- `visitors` - Scopes visitor data to organizations
- `article_mentions` - Scopes article tracking to organizations
- `article_views` - Scopes article views to organizations

## Code Changes Required

### 1. API Authentication (`lib/api-auth.ts`) ✅ DONE
- Updated `authorizeRequest()` to return `{ authorized: boolean, organizationId?: string }`
- Now looks up organization by API key instead of hardcoding 'visit-fort-myers'
- Returns organizationId for filtering queries

### 2. External API Routes (Accept data from Concierge app)

These routes need to:
1. Call `authorizeRequest()` and get `organizationId`
2. Add `organization_id` to all INSERT statements

**Routes to update:**
- `/api/chats/create` - Add organization_id when creating chats
- `/api/chats/message` - Ensure chat belongs to organization
- `/api/visitors/identify` - Add organization_id when creating visitors
- `/api/articles/mention` - Add organization_id to mentions
- `/api/articles/view` - Add organization_id to views

### 3. Internal API Routes (Dashboard queries)

These routes need to filter by user's organization. Two approaches:

**Option A: Use NextAuth session**
```typescript
const session = await getServerSession(authOptions);
const user = await supabaseAdmin
  .from('users')
  .select('organization_id')
  .eq('email', session.user.email)
  .single();

// Then filter all queries:
.eq('organization_id', user.data.organization_id)
```

**Option B: Pass organization_id from middleware**
Set up middleware to add `x-organization-id` header based on session.

**Routes to update:**
- `/api/chats` - Filter chats by organization
- `/api/chats/[chatId]/messages` - Verify chat belongs to organization
- `/api/users` - Filter users by organization
- `/api/visitors` - Filter visitors by organization
- `/api/visitors/[id]` - Verify visitor belongs to organization
- `/api/visitors/[id]/chats` - Filter by organization
- `/api/visitors/[id]/views` - Filter by organization
- `/api/analytics/*` - All analytics routes must filter by organization
- `/api/articles/stats` - Filter by organization

### 4. NextAuth Configuration

Update `/app/api/auth/[...nextauth]/route.ts`:

```typescript
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      // Fetch user's organization_id
      const { data } = await supabaseAdmin
        .from('users')
        .select('id, organization_id, role')
        .eq('email', session.user.email)
        .single();

      session.user.id = data.id;
      session.user.organizationId = data.organization_id;
      session.user.role = data.role;
    }
    return session;
  }
}
```

### 5. Helper Function

Create `lib/get-user-organization.ts`:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from './supabase';

export async function getUserOrganization(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const { data } = await supabaseAdmin
    .from('users')
    .select('organization_id')
    .eq('email', session.user.email)
    .single();

  return data?.organization_id || null;
}
```

## Migration Steps

1. ✅ Create migration file
2. ✅ Update `lib/api-auth.ts`
3. ⏳ Apply database migration
4. ⏳ Update external API routes (5 routes)
5. ⏳ Create `lib/get-user-organization.ts` helper
6. ⏳ Update NextAuth callbacks
7. ⏳ Update internal API routes (20+ routes)
8. ⏳ Test with multiple organizations
9. ⏳ Deploy to production

## Testing Plan

1. Create a second organization in database
2. Generate API key for second organization
3. Configure test concierge instance with second API key
4. Verify data from second org doesn't appear in first org's dashboard
5. Verify users can only see their org's data

## Rollback Plan

If issues arise, rollback by:
1. Reverting code changes
2. Running rollback migration to remove organization_id columns
3. Redeploying previous version

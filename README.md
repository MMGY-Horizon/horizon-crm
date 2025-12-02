# Horizon CRM

Modern CRM and analytics platform for managing customer relationships and business insights.

## Features

- 📊 **Dashboard** - Analytics and metrics overview with charts
- 💬 **Chats** - Manage customer conversations
- 📍 **Places** - Track locations and venues
- 👥 **Users** - Manage registered users
- 👨‍💼 **Team** - Team management
- 🔍 **Crawler** - Web crawling management
- 🌐 **Web Integration** - Technical documentation for integration
- ⚙️ **Settings** - Configure your CRM
- 🔐 **Authentication** - Secure Google OAuth login

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google OAuth credentials (see [ENV_SETUP.md](./ENV_SETUP.md))
- Supabase project with service role key (see [ENV_SETUP.md](./ENV_SETUP.md))

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory. See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions on setting up Google OAuth and other required variables.

3. Run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001).

### Authentication Setup

This application uses NextAuth.js with Google OAuth for authentication. You'll need to:

1. Create a Google Cloud project
2. Set up OAuth 2.0 credentials
3. Configure the environment variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

## Project Structure

```
horizon-crm/
├── app/
│   ├── admin/               # Protected admin pages
│   ├── api/auth/            # NextAuth API routes
│   ├── api/chats/           # Concierge logging endpoints
│   └── auth/                # Authentication pages
├── components/
│   ├── admin/               # Admin UI components
│   ├── charts/              # Chart components
│   └── providers/           # Context providers
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   └── supabase.ts          # Shared Supabase clients
└── middleware.ts            # Route protection
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Supabase (Postgres + Realtime)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Protected Routes

All `/admin/*` routes are protected and require authentication. Unauthenticated users will be redirected to the sign-in page.

## Development

- The CRM runs on port **3001** to avoid conflicts with other applications
- Hot reload is enabled for all code changes
- TypeScript is configured for type safety

## Database Schema

The CRM uses Supabase (PostgreSQL) with three main tables:

### Tables

**`chats`** - Chat sessions
- `chat_id` (text, unique) - Human-readable chat identifier
- `session_id` (text, required) - Browser session ID
- `user_id` (text, optional) - Authenticated user ID
- `status` (text) - One of: `active`, `completed`, `abandoned`
- `metadata` (jsonb) - Flexible storage for custom data
- `created_at`, `updated_at` - Timestamps

**`messages`** - Individual chat messages
- `chat_id` (text, FK) - References chats with CASCADE delete
- `role` (text) - One of: `user`, `assistant`, `system`
- `content` (text) - Message text
- `metadata` (jsonb) - Token counts, sources, etc.
- `created_at` - Timestamp

**`chat_analytics`** (future) - AI-powered insights
- `topic_summary`, `intent`, `sentiment`, `user_satisfaction`

### Views

**`chats_with_counts`** - Pre-calculated aggregates
- All chat fields plus `message_count` and `last_message_at`
- Optimized for admin dashboard queries

### Key Features

✅ **Database Constraints**: Validates `status` and `role` values  
✅ **Optimized Indexes**: Fast queries on common patterns  
✅ **Cascade Deletes**: Clean up messages when chats are deleted  
✅ **JSONB Metadata**: Flexible schema for evolving requirements

See `supabase/schema.sql` for the complete schema.

## Concierge Integration

### Quick Start

1. Generate a secure API key:
   ```bash
   openssl rand -base64 32
   ```

2. Add to `.env.local`:
   ```env
   CRM_API_KEY=your-generated-key
   ```

3. Share the same key with Horizon Concierge

### API Endpoints

**`POST /api/chats/create`** - Create new chat session
```jsonc
{
  "sessionId": "session_xyz",  // required
  "userId": "user_123",        // optional
  "location": "Fort Myers, FL",
  "userAgent": "Mozilla/5.0...",
  "metadata": { "source": "concierge" }
}
```

**`POST /api/chats/message`** - Log message
```jsonc
{
  "chatId": "chat_abc",        // required
  "role": "user",              // user | assistant | system
  "content": "Message text",   // required
  "metadata": { "tokens": 150 }
}
```

### Security

- Both endpoints require `x-api-key` header
- Returns `401 Unauthorized` if missing/invalid
- API key is **server-side only** (never exposed to browser)
- All requests logged with `[CRM]` prefix for observability

### Features

✅ **Instant Visibility**: New chats appear in `/admin/chats` immediately  
✅ **Real-time Updates**: Uses Supabase real-time subscriptions (optional)  
✅ **Type-Safe**: Full TypeScript interfaces  
✅ **Observable**: Detailed logging for debugging  
✅ **Resilient**: Graceful error handling

See [`docs/CRM_INTEGRATION.md`](./docs/CRM_INTEGRATION.md) for complete API contract and examples.

## Horizon Ecosystem

This CRM is part of the larger Horizon platform. See the main project README for the complete ecosystem overview.

**Related Components:**
- **Concierge Frontend** (`/`) - Public-facing AI concierge that logs to this CRM
- **Drupal CMS** (`/horizon-drupal-project`) - Headless CMS with AI content generation

## Recent Improvements

### December 2024 Updates

✅ **Ecosystem Integration**
- Part of complete Horizon platform with Concierge and Drupal CMS
- Centralized chat logging from multiple sources
- Unified analytics across all touchpoints

### November 2024 Updates

✅ **Database Schema Improvements**
- Added CHECK constraints for `status` and `role` validation
- Made `session_id` required (NOT NULL)
- Renamed `messages.timestamp` → `created_at` for consistency
- Added 6 performance indexes for common query patterns
- Created `chats_with_counts` view for dashboard aggregates

✅ **API Enhancements**
- Fixed field naming: `externalUserId` → `userId`
- Removed redundant `timestamp` parameter
- Added comprehensive request logging with `[CRM]` prefix
- Improved error messages with context and details
- Better TypeScript type safety

✅ **Observability**
- All API requests logged for debugging
- Success/failure tracking with chat IDs
- Warning logs for authorization failures
- Error details included in API responses

See [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) for detailed migration guide.

## Deployment

The application is deployed on Vercel and connected to GitHub for automatic deployments.

```bash
vercel --prod
```

Make sure to configure environment variables in Vercel:
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - Authentication
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` - Database
- `CRM_API_KEY` - Concierge authentication

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)

## Documentation

- [`ENV_SETUP.md`](./ENV_SETUP.md) - Environment variable setup guide
- [`docs/CRM_INTEGRATION.md`](./docs/CRM_INTEGRATION.md) - Integration architecture and API contract
- [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) - Recent improvements and migration guide

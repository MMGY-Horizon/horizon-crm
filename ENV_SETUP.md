# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase (shared between web and CRM)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Concierge → CRM API Key (keep private)
CRM_API_KEY=replace-with-random-string
```

## Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - For local development: `http://localhost:3001/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

## Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```


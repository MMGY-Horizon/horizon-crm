# Vercel Environment Variables Setup for Horizon CRM

## Current Status ✅

All required environment variables are now configured in Vercel!

## Configured Variables

### Authentication
- ✅ GOOGLE_CLIENT_ID (All environments)
- ✅ GOOGLE_CLIENT_SECRET (All environments)
- ✅ NEXTAUTH_URL (All environments)
- ✅ NEXTAUTH_SECRET (All environments)

### Database & API
- ✅ NEXT_PUBLIC_SUPABASE_URL (All environments)
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (All environments)
- ✅ SUPABASE_SERVICE_ROLE_KEY (All environments)
- ✅ All Postgres/Supabase connection strings
- ✅ GROQ_API_KEY (All environments)
- ✅ CRM_API_KEY (All environments)

## Environment-Specific Values

### NEXTAUTH_URL
- **Production**: `https://horizon-crm.vercel.app`
- **Preview**: `https://horizon-crm.vercel.app`
- **Development**: `http://localhost:3001`

### GOOGLE_CLIENT_ID
- Value: `272686283842-9qpe27ghmso3om2oef6iov0dmviagpkj.apps.googleusercontent.com`
- Note: Make sure this client ID has the correct authorized redirect URIs in Google Cloud Console:
  - `https://horizon-crm.vercel.app/api/auth/callback/google`
  - `http://localhost:3001/api/auth/callback/google`

## Next Steps

1. ✅ All environment variables configured
2. ⚠️ Verify Google OAuth redirect URIs in Google Cloud Console
3. ✅ Deploy to Vercel to apply changes

## Testing After Deployment

1. Visit `https://horizon-crm.vercel.app`
2. Click "Sign in with Google"
3. Verify you can authenticate successfully
4. Check that Supabase connection works (data loads)
5. Test article mentions tracking from Concierge

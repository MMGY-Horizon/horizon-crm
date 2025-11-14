# Vercel Environment Variables Setup - CRM

## ✅ Required Variables for Vercel

Copy these **12 variables** from your local `.env.local` to Vercel Dashboard:

### **Go to:** https://vercel.com/dashboard
→ Select **horizon-crm** project  
→ **Settings** → **Environment Variables**

---

## 📋 Variables to Add:

### 1. NextAuth (Authentication)
```
NEXTAUTH_URL
NEXTAUTH_SECRET
```

### 2. Google OAuth
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### 3. Supabase (Database)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
```

### 4. API Keys
```
CRM_API_KEY
GROQ_API_KEY
```

---

## 🚀 Quick Copy Script

Run this to see all your values (then copy to Vercel):

```bash
cd /Users/jcallicott/nodejs/horizon-concierge/horizon-crm
cat .env.local
```

---

## 📝 How to Add Each Variable:

For each variable:

1. Click **Add New** button
2. **Name:** (paste variable name, e.g., `NEXTAUTH_URL`)
3. **Value:** (paste the value from your .env.local)
4. **Environment:** Check **all three** boxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**
6. Repeat for all 12 variables

---

## ⚠️ Important Notes:

### **Update `NEXTAUTH_URL` for Production:**
Your local `.env.local` has:
```
NEXTAUTH_URL=http://localhost:3001
```

**On Vercel, change this to:**
```
NEXTAUTH_URL=https://your-crm-domain.vercel.app
```
(Use your actual Vercel domain)

### **Update Google OAuth Redirect URI:**
After deploying, add your production URL to Google Console:
1. https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Authorized redirect URIs → Add:
   ```
   https://your-crm-domain.vercel.app/api/auth/callback/google
   ```

---

## ✅ Verification Checklist:

After adding all variables to Vercel:

- [ ] **12 variables** added
- [ ] `NEXTAUTH_URL` uses production domain (not localhost)
- [ ] All variables have **all 3 environments** checked
- [ ] Google OAuth redirect includes production domain
- [ ] Click **Redeploy** to load new environment variables

---

## 🧪 Test After Deployment:

### Test CRM loads:
```bash
curl https://your-crm-domain.vercel.app
```

### Test API works:
```bash
curl https://your-crm-domain.vercel.app/api/chats \
  -H "x-api-key: <your_CRM_API_KEY>"
```

### Test login:
1. Visit: https://your-crm-domain.vercel.app
2. Should redirect to /admin
3. Click "Sign in with Google"
4. Should authenticate successfully

---

## 🎯 Current Setup Summary:

✅ **Variables you have locally:** 12/12  
⚠️ **Variables on Vercel:** Need to add all 12  
📍 **Database:** Supabase (kjmbafzpzjmcupmapvac)  
🔐 **Auth:** Google OAuth + NextAuth  

---

**Next Step:** Add these 12 variables to Vercel, then redeploy!


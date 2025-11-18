# Post-Migration Checklist

## ✅ Migration Applied Successfully

You've run the multi-tenancy migration. Here's what to verify:

---

## Database Verification

Run these queries in Supabase SQL Editor to verify the migration:

### 1. Check Organization Exists
```sql
SELECT id, slug, name, api_key 
FROM organization_settings 
WHERE slug = 'visit-fort-myers';
```
**Expected:** Should return 1 row with Visit Fort Myers organization

### 2. Verify Column Added to All Tables
```sql
-- Check users
SELECT COUNT(*) as total, COUNT(organization_id) as with_org 
FROM users;

-- Check chats
SELECT COUNT(*) as total, COUNT(organization_id) as with_org 
FROM chats;

-- Check visitors
SELECT COUNT(*) as total, COUNT(organization_id) as with_org 
FROM visitors;

-- Check article_views
SELECT COUNT(*) as total, COUNT(organization_id) as with_org 
FROM article_views;

-- Check article_mentions
SELECT COUNT(*) as total, COUNT(organization_id) as with_org 
FROM article_mentions;
```
**Expected:** For each table, `total` should equal `with_org` (all records have organization_id)

### 3. Verify Indexes Created
```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE indexname LIKE 'idx_%_organization_id'
ORDER BY tablename;
```
**Expected:** Should show 5 indexes:
- idx_article_mentions_organization_id
- idx_article_views_organization_id
- idx_chats_organization_id
- idx_users_organization_id
- idx_visitors_organization_id

---

## Application Verification

### 1. Test Dashboard Access
1. Log into the CRM dashboard at http://localhost:3001
2. Navigate to Dashboard → should show analytics
3. Check that data loads without errors
4. Verify Settings page loads your organization info

### 2. Test API with Current API Key
```bash
# Get your current API key from the database or .env
API_KEY="hmz_izBMSqAtC96cOAvKnP8QjiOAUDaMrJxU"

# Test creating a chat
curl -X POST http://localhost:3001/api/chats/create \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "sessionId": "test-session-123",
    "chatId": "test-chat-123"
  }'
```
**Expected:** Should return success

### 3. Test Visitor Identification
```bash
curl -X POST http://localhost:3001/api/visitors/identify \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "email": "test@example.com",
    "session_id": "test-session-123"
  }'
```
**Expected:** Should create/update visitor with organization_id

---

## Data Verification Queries

### Check that new data gets organization_id
```sql
-- Check most recent chat
SELECT chat_id, organization_id, created_at 
FROM chats 
ORDER BY created_at DESC 
LIMIT 1;

-- Check most recent visitor
SELECT email, organization_id, created_at 
FROM visitors 
ORDER BY created_at DESC 
LIMIT 1;

-- Verify all data is linked to Visit Fort Myers
SELECT 
  (SELECT COUNT(*) FROM users WHERE organization_id = (SELECT id FROM organization_settings WHERE slug = 'visit-fort-myers')) as users,
  (SELECT COUNT(*) FROM chats WHERE organization_id = (SELECT id FROM organization_settings WHERE slug = 'visit-fort-myers')) as chats,
  (SELECT COUNT(*) FROM visitors WHERE organization_id = (SELECT id FROM organization_settings WHERE slug = 'visit-fort-myers')) as visitors;
```

---

## Testing Organization Isolation

### Create a Test Organization (Optional)

```sql
-- Insert test organization
INSERT INTO organization_settings (
  slug, 
  name, 
  location, 
  website_url, 
  api_key
) VALUES (
  'test-org',
  'Test Organization',
  'Test City, FL',
  'https://test.example.com',
  'test_' || substr(md5(random()::text), 1, 32)
)
RETURNING *;
```

Save the returned `api_key` and test with it to verify isolation!

---

## Common Issues & Solutions

### Issue: "column organization_id does not exist"
**Solution:** The migration didn't run completely. Re-run the migration SQL.

### Issue: "null value in column organization_id violates not-null constraint"
**Solution:** Some records didn't get backfilled. Run:
```sql
UPDATE users SET organization_id = (
  SELECT id FROM organization_settings WHERE slug = 'visit-fort-myers' LIMIT 1
) WHERE organization_id IS NULL;

-- Repeat for chats, visitors, article_views, article_mentions
```

### Issue: API returns 401 Unauthorized
**Solution:** 
1. Check API key in .env matches database
2. Verify organization_settings table has the API key
3. Check console logs for auth errors

### Issue: Dashboard shows no data
**Solution:**
1. Check browser console for errors
2. Verify your user has an organization_id
3. Check API logs in terminal

---

## Success Criteria

✅ All tables have organization_id column  
✅ All existing data has organization_id set  
✅ Indexes created successfully  
✅ Dashboard loads without errors  
✅ API accepts requests with valid key  
✅ New data gets organization_id automatically  

---

## Next Steps

Once everything is verified:

1. **Update Concierge .env** (if not done already)
   ```
   CRM_API_KEY=hmz_izBMSqAtC96cOAvKnP8QjiOAUDaMrJxU
   ```

2. **Deploy to Production**
   - Run migration in production Supabase
   - Update production environment variables
   - Monitor for any issues

3. **Monitor Logs**
   - Watch for authorization errors
   - Check API key usage
   - Verify data isolation

4. **Optional: Create Second Organization**
   - Test complete isolation
   - Verify different API keys work
   - Confirm no data leakage

---

## Support

If you encounter any issues:
1. Check the browser console
2. Check the terminal logs (where Next.js is running)
3. Check Supabase logs (Dashboard → Logs)
4. Review MULTI_TENANCY_TEST_REPORT.md for expected behavior

The implementation is complete - you're ready to go! 🚀

-- Verification queries to check multi-tenancy setup

-- 1. Check that organization_settings exists and has Visit Fort Myers
SELECT 'Organization Settings' as test, id, slug, name 
FROM organization_settings 
WHERE slug = 'visit-fort-myers'
LIMIT 1;

-- 2. Check users table has organization_id column
SELECT 'Users Table' as test, 
  COUNT(*) as total_users,
  COUNT(DISTINCT organization_id) as unique_orgs
FROM users;

-- 3. Check chats table has organization_id column
SELECT 'Chats Table' as test,
  COUNT(*) as total_chats,
  COUNT(DISTINCT organization_id) as unique_orgs
FROM chats;

-- 4. Check visitors table has organization_id column
SELECT 'Visitors Table' as test,
  COUNT(*) as total_visitors,
  COUNT(DISTINCT organization_id) as unique_orgs
FROM visitors;

-- 5. Check article_views table has organization_id column
SELECT 'Article Views Table' as test,
  COUNT(*) as total_views,
  COUNT(DISTINCT organization_id) as unique_orgs
FROM article_views;

-- 6. Check that indexes were created
SELECT 'Indexes Created' as test, 
  schemaname, tablename, indexname
FROM pg_indexes
WHERE indexname LIKE 'idx_%_organization_id'
ORDER BY tablename;

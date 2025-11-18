const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkViews() {
  const visitorId = 'afa4cb8c-0a50-4ec7-8c09-cd94cf4706e0';

  console.log(`Checking views for visitor: ${visitorId}\n`);

  // Check if article_views table has visitor_id column
  const columnsResult = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'article_views'
    AND table_schema = 'public'
  `);

  console.log('article_views columns:');
  columnsResult.rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
  console.log('');

  // Check views linked to this visitor
  const viewsResult = await pool.query(
    'SELECT * FROM article_views WHERE visitor_id = $1 ORDER BY viewed_at DESC LIMIT 5',
    [visitorId]
  );
  console.log(`Views linked to visitor_id: ${viewsResult.rows.length}`);
  viewsResult.rows.forEach(row => console.log(row));
  console.log('');

  // Check total views
  const totalViewsResult = await pool.query('SELECT COUNT(*) as total FROM article_views');
  console.log(`Total views in database: ${totalViewsResult.rows[0].total}`);
  console.log('');

  // Sample views
  const sampleResult = await pool.query('SELECT id, article_id, article_name, visitor_id FROM article_views LIMIT 3');
  console.log('Sample views:');
  sampleResult.rows.forEach(row => console.log(row));

  await pool.end();
}

checkViews().catch(console.error);

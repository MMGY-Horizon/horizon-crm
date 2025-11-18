const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
});

async function linkTestViews() {
  const visitorId = 'afa4cb8c-0a50-4ec7-8c09-cd94cf4706e0';

  // Link the first 3 views to this visitor for testing
  const result = await pool.query(
    `UPDATE article_views
     SET visitor_id = $1
     WHERE id IN (
       SELECT id FROM article_views
       WHERE visitor_id IS NULL
       LIMIT 3
     )
     RETURNING *`,
    [visitorId]
  );

  console.log(`Linked ${result.rows.length} views to visitor:\n`);
  result.rows.forEach(view => {
    console.log(`- ${view.article_id} (${view.article_type || 'unknown'}) viewed at ${view.viewed_at}`);
  });

  await pool.end();
}

linkTestViews().catch(console.error);

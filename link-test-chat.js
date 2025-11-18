const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
});

async function linkTestChat() {
  const visitorId = 'afa4cb8c-0a50-4ec7-8c09-cd94cf4706e0';

  // Get the first chat and link it to this visitor for testing
  const result = await pool.query(
    'UPDATE chats SET visitor_id = $1 WHERE chat_id = (SELECT chat_id FROM chats LIMIT 1) RETURNING *',
    [visitorId]
  );

  console.log('Linked chat to visitor:');
  console.log(result.rows[0]);

  await pool.end();
}

linkTestChat().catch(console.error);

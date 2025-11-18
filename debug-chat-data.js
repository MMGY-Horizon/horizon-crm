const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugChatData() {
  const visitorId = 'afa4cb8c-0a50-4ec7-8c09-cd94cf4706e0';

  // Check what the database has
  const result = await pool.query(
    'SELECT chat_id, metadata, created_at FROM chats WHERE visitor_id = $1',
    [visitorId]
  );

  console.log('Database chat data:');
  result.rows.forEach(row => {
    console.log('\nChat ID:', row.chat_id);
    console.log('Created:', row.created_at);
    console.log('Metadata:', JSON.stringify(row.metadata, null, 2));
  });

  await pool.end();
}

debugChatData().catch(console.error);

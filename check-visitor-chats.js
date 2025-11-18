const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkVisitorChats() {
  const visitorId = 'afa4cb8c-0a50-4ec7-8c09-cd94cf4706e0';

  console.log(`Checking chats for visitor: ${visitorId}\n`);

  // Check visitor exists
  const visitorResult = await pool.query(
    'SELECT * FROM visitors WHERE id = $1',
    [visitorId]
  );
  console.log('Visitor:', visitorResult.rows[0] || 'NOT FOUND');
  console.log('');

  // Check chats linked to this visitor
  const chatsResult = await pool.query(
    'SELECT chat_id, session_id, visitor_id, user_id, created_at FROM chats WHERE visitor_id = $1',
    [visitorId]
  );
  console.log(`Chats linked to visitor_id: ${chatsResult.rows.length}`);
  chatsResult.rows.forEach(row => console.log(row));
  console.log('');

  // Check if visitor has chats via user_id instead
  const userIdChatsResult = await pool.query(
    'SELECT chat_id, session_id, visitor_id, user_id, created_at FROM chats WHERE user_id = $1',
    [visitorId]
  );
  console.log(`Chats linked via user_id: ${userIdChatsResult.rows.length}`);
  userIdChatsResult.rows.forEach(row => console.log(row));
  console.log('');

  // Check all chats to see structure
  const allChatsResult = await pool.query(
    'SELECT chat_id, session_id, visitor_id, user_id FROM chats LIMIT 5'
  );
  console.log('Sample chats (first 5):');
  allChatsResult.rows.forEach(row => console.log(row));

  await pool.end();
}

checkVisitorChats().catch(console.error);

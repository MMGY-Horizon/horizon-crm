const fetch = require('node-fetch');

async function testChatsAPI() {
  const visitorId = 'afa4cb8c-0a50-4ec7-8c09-cd94cf4706e0';
  const url = `http://localhost:3001/api/visitors/${visitorId}/chats`;

  console.log(`Testing: ${url}\n`);

  const response = await fetch(url);
  const data = await response.json();

  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testChatsAPI().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('='.repeat(80));
console.log('🗑️  Horizon CRM - Reset Test Data');
console.log('='.repeat(80));
console.log(`\n🔗 Connected to: ${supabaseUrl}\n`);

async function resetData() {
  const results = {
    article_views: 0,
    article_mentions: 0,
    messages: 0,
    chats: 0,
    errors: []
  };

  try {
    // 1. Delete article views
    console.log('  → Deleting article_views...');
    const { error: viewsError, count: viewsCount } = await supabase
      .from('article_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (viewsError) {
      results.errors.push(`article_views: ${viewsError.message}`);
      console.log(`    ❌ Error: ${viewsError.message}`);
    } else {
      results.article_views = viewsCount || 0;
      console.log(`    ✅ Deleted ${viewsCount || 'all'} article views`);
    }

    // 2. Delete article mentions
    console.log('  → Deleting article_mentions...');
    const { error: mentionsError, count: mentionsCount } = await supabase
      .from('article_mentions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (mentionsError) {
      results.errors.push(`article_mentions: ${mentionsError.message}`);
      console.log(`    ❌ Error: ${mentionsError.message}`);
    } else {
      results.article_mentions = mentionsCount || 0;
      console.log(`    ✅ Deleted ${mentionsCount || 'all'} article mentions`);
    }

    // 3. Delete messages (cascades are handled by DB)
    console.log('  → Deleting messages...');
    const { error: messagesError, count: messagesCount } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (messagesError) {
      results.errors.push(`messages: ${messagesError.message}`);
      console.log(`    ❌ Error: ${messagesError.message}`);
    } else {
      results.messages = messagesCount || 0;
      console.log(`    ✅ Deleted ${messagesCount || 'all'} messages`);
    }

    // 4. Delete chats
    console.log('  → Deleting chats...');
    const { error: chatsError, count: chatsCount } = await supabase
      .from('chats')
      .delete()
      .neq('chat_id', ''); // Delete all

    if (chatsError) {
      results.errors.push(`chats: ${chatsError.message}`);
      console.log(`    ❌ Error: ${chatsError.message}`);
    } else {
      results.chats = chatsCount || 0;
      console.log(`    ✅ Deleted ${chatsCount || 'all'} chats`);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    results.errors.push(`Unexpected: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Reset Summary');
  console.log('='.repeat(80));
  console.log(`  Article Views: ${results.article_views} deleted`);
  console.log(`  Article Mentions: ${results.article_mentions} deleted`);
  console.log(`  Messages: ${results.messages} deleted`);
  console.log(`  Chats: ${results.chats} deleted`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('\n✅ All test data successfully deleted!');
  }

  console.log('='.repeat(80));
}

// Run the reset
resetData()
  .then(() => {
    console.log('\n✨ Reset complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Reset failed:', error);
    process.exit(1);
  });

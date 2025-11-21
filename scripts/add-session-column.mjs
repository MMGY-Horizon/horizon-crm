import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSessionColumn() {
  console.log('Adding session_id column to visitors table...');

  // Add the column
  const { data, error } = await supabase.rpc('exec', {
    sql: `
      ALTER TABLE visitors
      ADD COLUMN IF NOT EXISTS session_id TEXT;

      CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
    `
  });

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('✅ Session column added successfully');
}

addSessionColumn();

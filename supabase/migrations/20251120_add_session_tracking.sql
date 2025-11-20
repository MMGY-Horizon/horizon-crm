-- Add session_id to visitors table for direct session-to-visitor mapping
-- This allows us to link trips and other actions to visitors even before a chat is created

ALTER TABLE visitors
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create an index on session_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);

-- Add a comment explaining the column
COMMENT ON COLUMN visitors.session_id IS 'Browser session ID from localStorage, used to track visitors before they identify themselves';

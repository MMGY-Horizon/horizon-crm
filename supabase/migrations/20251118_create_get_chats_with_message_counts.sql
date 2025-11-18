-- Create a function to efficiently get chats with message counts
-- This replaces N+1 queries with a single query using a JOIN
CREATE OR REPLACE FUNCTION get_chats_with_message_counts()
RETURNS TABLE (
  id UUID,
  chat_id TEXT,
  session_id TEXT,
  user_id TEXT,
  location TEXT,
  user_agent TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  visitor_id UUID,
  message_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.chat_id,
    c.session_id,
    c.user_id,
    c.location,
    c.user_agent,
    c.status,
    c.metadata,
    c.created_at,
    c.updated_at,
    c.visitor_id,
    COALESCE(COUNT(m.id), 0) AS message_count
  FROM
    chats c
  LEFT JOIN
    messages m ON m.chat_id = c.chat_id
  GROUP BY
    c.id, c.chat_id, c.session_id, c.user_id, c.location, c.user_agent,
    c.status, c.metadata, c.created_at, c.updated_at, c.visitor_id
  ORDER BY
    c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

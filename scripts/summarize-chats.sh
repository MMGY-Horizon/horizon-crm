#!/bin/bash

# Summarize All Unsummarized Chats
# This script runs the AI summarization on all chats that haven't been summarized yet

echo "🤖 Starting chat summarization..."
echo ""

curl -X GET "http://localhost:3001/api/chats/summarize" \
  -H "x-api-key: local_dev_key_2024_secure_horizon_crm" \
  -H "Content-Type: application/json" \
  -s | python3 -m json.tool

echo ""
echo "✅ Summarization complete!"
echo ""
echo "View results at: http://localhost:3001/admin/chats"


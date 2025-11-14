# Chat Summarization & Scoring

## Overview

The CRM automatically analyzes chat conversations using AI to generate:
- **Short Topic Summary** (max 10 words) - What the user asked about
- **User Score** (1-5) - How satisfied the user likely is
- **Sentiment** (positive/neutral/negative)
- **Topics** - Key subjects discussed

## How It Works

### 1. Automatic Summarization (Cron Job)

**Schedule:** Every hour (configurable in `vercel.json`)

```
Hourly Cron → /api/cron/summarize-chats
    ↓
Finds unsummarized chats
    ↓
Calls /api/chats/summarize
    ↓
For each chat:
  - Fetches all messages
  - Sends to Groq AI (Llama 3.3 70B)
  - Generates summary + score
  - Updates chat metadata
```

### 2. Manual Summarization

You can also trigger summarization manually via API:

**Summarize specific chat:**
```bash
curl -X POST http://localhost:3001/api/chats/summarize \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_crm_api_key" \
  -d '{"chatId": "chat_xxx"}'
```

**Summarize all unsummarized chats:**
```bash
curl -X GET http://localhost:3001/api/chats/summarize \
  -H "x-api-key: your_crm_api_key"
```

## AI Analysis

### Prompt Used

The AI analyzes each conversation and provides:

1. **Topic Summary** - Concise description of what the user wanted
   - Example: "Looking for family-friendly beaches"
   - Example: "Asking about seafood restaurants"
   - Example: "Planning weekend activities"

2. **User Score (1-5)**
   - **5** = Fully satisfied, got exactly what they needed
   - **4** = Mostly satisfied, good recommendations
   - **3** = Neutral, adequate response
   - **2** = Somewhat dissatisfied, could be better
   - **1** = Very dissatisfied, needs improvement

3. **Sentiment**
   - **positive** - User seems happy, engaged
   - **neutral** - Standard interaction
   - **negative** - User frustrated or unhappy

4. **Topics** - Key subjects (up to 3)
   - Example: `["beaches", "family activities", "hotels"]`

### AI Model

- **Model:** Llama 3.3 70B (via Groq)
- **Temperature:** 0.3 (more consistent)
- **Format:** JSON
- **Fallback:** If AI fails, returns default values

## Data Storage

Summaries are stored in the `chats` table metadata:

```json
{
  "metadata": {
    "topicSummary": "Best beaches for families",
    "userScore": 4,
    "sentiment": "positive",
    "topics": ["beaches", "family"],
    "summarizedAt": "2025-11-14T12:00:00.000Z",
    "source": "concierge"
  }
}
```

## Viewing Summaries

### In CRM Dashboard

Visit: http://localhost:3001/admin/chats

The table shows:
- **Short Topic Summary** column - AI-generated summary
- **Score (1-5)** column - User satisfaction score

**Before summarization:** Shows "Pending..." and "-"
**After summarization:** Shows the actual summary and score

### Via API

```bash
# Get all chats with summaries
curl http://localhost:3001/api/chats | jq '.[].metadata'
```

## Cron Job Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/summarize-chats",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule:**
- `0 * * * *` = Every hour at minute 0
- Can be changed to:
  - `*/30 * * * *` = Every 30 minutes
  - `0 */6 * * *` = Every 6 hours
  - `0 0 * * *` = Daily at midnight

## Environment Variables Required

```bash
# For AI summarization
GROQ_API_KEY=gsk_...

# For API authentication
CRM_API_KEY=your_api_key

# For cron job security
CRON_SECRET=your_cron_secret

# Base URL (production)
NEXTAUTH_URL=https://your-crm-domain.vercel.app
```

### Generate CRON_SECRET:
```bash
openssl rand -base64 32
```

Add to Vercel Dashboard:
Settings → Environment Variables → Add `CRON_SECRET`

## Testing

### Test Locally

1. **Create a test chat:**
```bash
# Visit http://localhost:3000 and ask a question
```

2. **Manually trigger summarization:**
```bash
curl -X GET http://localhost:3001/api/chats/summarize \
  -H "x-api-key: local_dev_key_2024_secure_horizon_crm"
```

3. **Check results:**
```bash
curl http://localhost:3001/api/chats | jq '.[0].metadata'
```

### Test Cron Job in Production

After deploying to Vercel:

1. Go to Vercel Dashboard → Your Project
2. **Deployments** → Select deployment
3. **Functions** → Find `api/cron/summarize-chats`
4. Click **Invoke** to test manually

## Monitoring

### View Logs

**Local development:**
```bash
# Check server console output
# You'll see: [CRON] Starting chat summarization job...
```

**Production (Vercel):**
1. Vercel Dashboard → Deployments
2. Select deployment → Functions
3. Click on function → View logs

### Success Indicators

```
✓ Summarized chat_xxx: "Best seafood restaurants" (Score: 4)
✓ Summarized chat_yyy: "Family beach activities" (Score: 5)
```

### Expected Output

```json
{
  "success": true,
  "totalProcessed": 3,
  "successCount": 3,
  "failCount": 0,
  "results": [
    {
      "chatId": "chat_xxx",
      "success": true,
      "summary": "Best seafood restaurants",
      "score": 4
    }
  ]
}
```

## Performance

- **Processing time:** ~2-3 seconds per chat
- **Batch limit:** 50 chats per run
- **API costs:** ~$0.001 per summary (Groq pricing)

## Troubleshooting

### Summaries Not Appearing

**Check:**
1. GROQ_API_KEY is set
2. Cron job is configured in vercel.json
3. CRON_SECRET is set in Vercel
4. Cron job is running (check logs)

**Manually trigger:**
```bash
curl -X GET http://localhost:3001/api/chats/summarize \
  -H "x-api-key: your_key"
```

### AI Returns Bad Summaries

**Adjust the prompt in:**
`horizon-crm/app/api/chats/summarize/route.ts`

Change temperature:
- Lower (0.1) = More consistent, less creative
- Higher (0.5) = More varied, more creative

### Cron Job Not Running

**Verify in Vercel:**
1. Dashboard → Project → Settings → Cron Jobs
2. Should show: `/api/cron/summarize-chats` with schedule

**Check authentication:**
- CRON_SECRET must match in both:
  - Environment variables
  - Cron function authorization check

## Future Enhancements

### Possible Additions:

1. **Sentiment-based Alerts**
   - Send notification when score < 3
   - Flag negative sentiment chats

2. **Topic Clustering**
   - Group chats by similar topics
   - Identify trending questions

3. **Response Templates**
   - Generate suggested responses based on analysis
   - Improve future AI responses

4. **User Feedback Loop**
   - Allow admins to correct scores
   - Retrain/adjust prompts based on feedback

5. **Real-time Summarization**
   - Summarize immediately after chat ends
   - No need to wait for cron job

---

**Status:** ✅ Implemented and ready to use
**Last Updated:** November 14, 2025


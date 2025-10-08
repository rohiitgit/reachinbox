# Quick Setup Guide

## Step-by-Step Setup (5 minutes)

### 1. Prerequisites Check
```bash
# Check Node.js version (need 18+)
node --version

# Check Docker
docker --version
docker-compose --version
```

### 2. Gmail App Password Setup
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Security → 2-Step Verification (enable if not enabled)
3. Security → App passwords
4. Select "Mail" and "Other (Custom name)"
5. Name it "Reachinbox"
6. Copy the 16-character password

### 3. Get API Keys

#### Google Gemini API Key (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy and save it
4. **Note**: Free tier provides 10 requests/min for `gemini-2.5-flash-lite` model

#### Slack Webhook (Optional)
1. Go to [Slack API](https://api.slack.com/messaging/webhooks)
2. Create new webhook for your workspace
3. Copy webhook URL

#### Webhook.site
1. Go to [webhook.site](https://webhook.site)
2. Copy your unique URL

### 4. Environment Setup
```bash
cd backend
cp .env.example .env
nano .env  # or use your preferred editor
```

Paste your credentials:
```env
IMAP_USER_1=your-email@gmail.com
IMAP_PASSWORD_1=xxxx xxxx xxxx xxxx  # App password
IMAP_USER_2=second-email@gmail.com
IMAP_PASSWORD_2=yyyy yyyy yyyy yyyy

GEMINI_API_KEY=AIza...  # From Google AI Studio

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
WEBHOOK_URL=https://webhook.site/your-unique-id

# Optional: Customize RAG context for AI replies
RAG_CONTEXT=I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example
```

### 5. Start Services
```bash
# Terminal 1: Start Docker
docker-compose up -d

# Wait 30 seconds for Elasticsearch
sleep 30

# Terminal 2: Start Backend
cd backend
npm install
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### 6. Verify Setup
1. Open browser: [http://localhost:5173](http://localhost:5173)
2. Check connection status (green dots)
3. Send test email to your configured accounts
4. Wait ~10 seconds
5. Refresh frontend to see new email

### 7. Test with Postman
1. Import `Reachinbox.postman_collection.json`
2. Run "Health Check" request
3. Run "Get Connection Status"
4. Run "Search All Emails"

## Common Issues

### "Cannot connect to Elasticsearch"
```bash
# Check if Elasticsearch is running
docker-compose ps

# View logs
docker-compose logs elasticsearch

# Restart Elasticsearch
docker-compose restart elasticsearch
```

### "IMAP authentication failed"
- ✅ Use app password, not regular password
- ✅ Enable IMAP in Gmail settings
- ✅ Check for typos in .env

### "Gemini API error" or "429 Rate Limit"
- ✅ Verify API key is correct (get from https://aistudio.google.com/app/apikey)
- ✅ Free tier limit: 10 requests/minute for `gemini-2.5-flash-lite`
- ✅ Emails will be marked "Uncategorized" when rate limit hit
- ✅ Ensure no extra spaces in .env
- ✅ Rate limits reset every minute automatically

### "No emails syncing"
- ✅ Check IMAP credentials
- ✅ Verify emails exist in last 30 days
- ✅ Check backend logs for errors

## Testing Checklist

- [ ] Docker services running (elasticsearch, qdrant)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] IMAP connections active (green dots)
- [ ] Emails visible in UI
- [ ] Search functionality works
- [ ] Category filters work
- [ ] Email details load correctly
- [ ] AI reply generation works
- [ ] Slack notification received (for Interested emails)
- [ ] Webhook triggered (check webhook.site)

## Quick Commands

```bash
# Stop all services
docker-compose down

# View backend logs
cd backend && npm run dev

# Rebuild backend
cd backend && npm run build

# Check Elasticsearch
curl http://localhost:9200

# Check Qdrant
curl http://localhost:6333

# Reset Elasticsearch data
docker-compose down -v
docker-compose up -d
```

## Next Steps

1. ✅ Complete basic setup
2. ✅ Test all features
3. ✅ Record demo video (<5 mins)
4. ✅ Update README with your name
5. ✅ Create private GitHub repo
6. ✅ Grant access to "Mitrajit"
7. ✅ Submit form: https://forms.gle/DqF27M4Sw1dJsf4j6

## Demo Video Script (5 minutes)

### 0:00-0:30: Introduction
- Show architecture diagram
- Explain tech stack
- List features

### 0:30-1:30: Backend Demo (Postman)
- Health check
- Connection status
- Search emails
- Filter by category
- Generate AI reply

### 1:30-3:00: Frontend Demo
- Show email list
- Demonstrate search
- Filter by account/category
- Open email details
- Show AI categorization
- Generate suggested reply

### 3:00-4:00: Real-time Features
- Send test email
- Show real-time sync (no refresh needed)
- Demonstrate Slack notification
- Show webhook.site trigger

### 4:00-5:00: Code Highlights
- IMAP IDLE implementation
- RAG service with vector DB
- AI categorization logic
- Wrap up & thank you

## Support

For issues or questions:
1. Check this guide
2. Review backend logs
3. Check Docker logs
4. Verify .env configuration

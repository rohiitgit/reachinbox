# Quick Reference Card

## 🚀 One-Command Start

```bash
./start.sh
cd backend && npm install && npm run dev  # Terminal 1
cd frontend && npm install && npm run dev  # Terminal 2
```

## 📍 URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Elasticsearch**: http://localhost:9200
- **Qdrant**: http://localhost:6333

## 🔑 Essential Commands

```bash
# Check services
docker-compose ps

# View logs
docker-compose logs elasticsearch
docker-compose logs qdrant

# Stop all
docker-compose down

# Restart
docker-compose restart

# Clean slate
docker-compose down -v && docker-compose up -d
```

## 📡 API Quick Tests

```bash
# Health check
curl http://localhost:3000/health

# Connection status
curl http://localhost:3000/api/emails/status/connections

# Search all emails
curl http://localhost:3000/api/emails/search

# Search with query
curl "http://localhost:3000/api/emails/search?q=meeting"

# Filter by category
curl "http://localhost:3000/api/emails/search?category=Interested"

# Get statistics
curl http://localhost:3000/api/emails/stats/overview

# Generate AI reply (replace <id>)
curl -X POST http://localhost:3000/api/emails/<id>/reply
```

## 🔧 Environment Variables

```env
# Minimum required in backend/.env
IMAP_HOST_1=imap.gmail.com
IMAP_PORT_1=993
IMAP_USER_1=your-email@gmail.com
IMAP_PASSWORD_1=your-app-password
IMAP_TLS_1=true

IMAP_HOST_2=imap.gmail.com
IMAP_PORT_2=993
IMAP_USER_2=second-email@gmail.com
IMAP_PASSWORD_2=your-app-password
IMAP_TLS_2=true

OPENAI_API_KEY=sk-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
WEBHOOK_URL=https://webhook.site/your-id
```

## 📊 Feature Testing Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Elasticsearch responding on 9200
- [ ] Qdrant responding on 6333
- [ ] IMAP connections active (green dots in UI)
- [ ] Emails visible in frontend
- [ ] Search works
- [ ] Category filters work
- [ ] Email details load
- [ ] AI categorization showing
- [ ] Can generate AI replies
- [ ] Slack notification received (if configured)
- [ ] Webhook triggered (check webhook.site)

## 🐛 Troubleshooting

### Elasticsearch won't start
```bash
docker-compose logs elasticsearch
# If memory error, increase Docker memory limit
```

### IMAP connection failed
- Use Gmail app password, not regular password
- Enable IMAP in Gmail settings
- Check for typos in .env

### No emails syncing
```bash
# Check backend logs
cd backend && npm run dev
# Look for IMAP connection success messages
```

### Frontend can't connect
- Verify backend is running on port 3000
- Check browser console for errors
- Ensure CORS is configured

## 📁 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation |
| `SETUP_GUIDE.md` | Step-by-step setup |
| `ARCHITECTURE.md` | System design |
| `FEATURES.md` | Feature checklist |
| `PROJECT_SUMMARY.md` | Executive summary |
| `backend/.env` | Configuration |
| `docker-compose.yml` | Services config |
| `Reachinbox.postman_collection.json` | API tests |

## 🎬 Demo Script (5 min)

### 0:00-0:30: Overview
- Architecture diagram
- Tech stack
- Features list

### 0:30-2:00: Backend (Postman)
- Health check
- Connection status
- Search emails
- Filter by category
- Generate AI reply
- Show statistics

### 2:00-3:30: Frontend
- Email list view
- Search functionality
- Category filtering
- Email details
- AI categorization badges
- Suggested reply display

### 3:30-4:30: Real-Time
- Send test email
- Watch real-time sync
- Slack notification
- Webhook trigger
- Auto-categorization

### 4:30-5:00: Code & Wrap-up
- IMAP IDLE code
- RAG implementation
- Thank you

## 🎯 Key Selling Points

1. **Real-time** - IMAP IDLE, no cron
2. **AI-Powered** - GPT-3.5 categorization
3. **RAG** - Vector DB + LLM replies
4. **Scalable** - Elasticsearch + modular design
5. **Type-Safe** - 100% TypeScript
6. **Documented** - 4 comprehensive docs
7. **Production-Ready** - Error handling, auto-reconnect
8. **Modern Stack** - React 18, Node.js 20, Vite 5

## 📞 Emergency Help

1. Check `SETUP_GUIDE.md` for detailed instructions
2. Review backend logs for errors
3. Verify `.env` configuration
4. Ensure Docker services are running
5. Check API health endpoint

## 🎓 Tech Stack Summary

**Backend**: Node.js + TypeScript + Express
**Frontend**: React + TypeScript + Vite
**Search**: Elasticsearch 8.11
**Vector DB**: Qdrant
**AI**: OpenAI (GPT-3.5-turbo, ada-002)
**IMAP**: `imap` library with IDLE
**Containers**: Docker + Docker Compose

## 📈 Performance

- Initial sync: 1-5 min
- Real-time: <10 sec
- Search: <100ms
- AI categorize: ~1-2s
- RAG reply: ~2-3s

## ✅ Submission Checklist

- [ ] All features working
- [ ] Demo video recorded
- [ ] GitHub repo created (private)
- [ ] Access granted to "Mitrajit"
- [ ] Form submitted
- [ ] README updated with your name

## 🔗 Important Links

- **Form**: https://forms.gle/DqF27M4Sw1dJsf4j6
- **Gmail App Password**: https://myaccount.google.com/apppasswords
- **Slack Webhooks**: https://api.slack.com/messaging/webhooks
- **Webhook.site**: https://webhook.site
- **OpenAI API**: https://platform.openai.com/api-keys

---

**Keep this card handy during demo and testing!**

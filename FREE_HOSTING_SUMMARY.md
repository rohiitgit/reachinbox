# 🎉 100% FREE Hosting Setup

Your Reachinbox application is ready to deploy for **$0/month**!

## What You'll Get (All Free)

| Service | Provider | What It Does | Free Tier |
|---------|----------|--------------|-----------|
| 🖥️ **Backend** | Render.com | Node.js API server | 512MB RAM, sleeps after 15min |
| 🎨 **Frontend** | Vercel | React static site | Unlimited bandwidth |
| 🔍 **Search** | Bonsai | Elasticsearch | 35MB storage (~5k emails) |
| 🧠 **Vector DB** | Qdrant Cloud | RAG embeddings | 1GB cluster |
| 🤖 **AI** | Google Gemini | Email categorization | 10 requests/min |

**Total Monthly Cost: $0** 🎊

---

## Step-by-Step (30 Minutes Total)

### 1. Setup Qdrant Cloud (5 min) ☁️
1. Visit: https://cloud.qdrant.io
2. Sign up (no credit card)
3. Create free cluster
4. Copy URL + API key

### 2. Setup Bonsai Elasticsearch (5 min) 🔍
1. Visit: https://bonsai.io
2. Sign up
3. Create "Sandbox" cluster
4. Copy connection URL

### 3. Deploy Backend (10 min) 🚀
1. Visit: https://render.com
2. Connect GitHub repo
3. New Web Service:
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && node dist/server.js`
4. Add environment variables (from your .env)
5. Deploy!

### 4. Deploy Frontend (5 min) 🎨
1. Visit: https://vercel.com
2. Import GitHub repo
3. Root directory: `frontend`
4. Add env: `VITE_API_URL=<your-render-url>`
5. Deploy!

### 5. Test Everything (5 min) ✅
```bash
# Test backend
curl https://your-app.onrender.com/health

# Open frontend
open https://your-app.vercel.app
```

---

## Important Notes ⚠️

### Backend Sleeps After 15 Minutes
- First request after sleep: 30-50 seconds ⏱️
- **Solution**: Use free ping service (UptimeRobot/Cron-Job.org)
- Ping `/health` every 14 minutes to keep awake

### Elasticsearch Limited to 35MB
- Stores ~5,000-10,000 emails 📧
- Good for demo/portfolio
- Upgrade to $10/month for 100MB if needed

### Gemini Rate Limits
- 10 requests per minute ⚡
- Emails marked "Uncategorized" when limit hit
- Resets automatically every minute

---

## After Deployment

Update your README.md with live URLs:
```markdown
## Live Demo
- Frontend: https://reachinbox-xyz.vercel.app
- Backend: https://reachinbox-xyz.onrender.com
```

---

## Optional: Keep Backend Awake

### Use Cron-Job.org (Free)
1. Visit: https://cron-job.org
2. Create job:
   - URL: `https://your-app.onrender.com/health`
   - Every 14 minutes
3. Save

Now your backend stays awake! 🎉

---

## Need Help?

📖 **Detailed Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
✅ **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
🛠️ **Quick Start**: Run `./deploy.sh`

---

## Upgrade Path (If Needed Later)

If you outgrow free tiers:

| Service | Cost | Upgrade Benefit |
|---------|------|-----------------|
| Render Starter | $7/mo | No sleep, always on |
| Bonsai Growth | $10/mo | 100MB storage |
| Qdrant Standard | $25/mo | 4GB cluster |
| **Total** | **$42/mo** | Production-ready |

But for demo/portfolio, **free tier is perfect!** ✨

---

## Quick Links

- Qdrant Cloud: https://cloud.qdrant.io
- Bonsai: https://bonsai.io
- Render: https://render.com
- Vercel: https://vercel.com
- Gemini API: https://aistudio.google.com/app/apikey
- Cron-Job: https://cron-job.org

---

**Ready to deploy? Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)!** 🚀

# Deployment Checklist

Follow this checklist to deploy your application for **FREE**.

## Before You Start

- [ ] All code committed to Git
- [ ] GitHub repository created (private)
- [ ] Gmail app passwords generated (for both accounts)
- [ ] Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Step 1: Setup Qdrant Cloud ☁️

- [ ] Sign up at [cloud.qdrant.io](https://cloud.qdrant.io)
- [ ] Create free cluster (1GB)
- [ ] Copy cluster URL
- [ ] Copy API key
- [ ] Save both for later

**Example**:
```
QDRANT_URL=https://abc-xyz.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your-api-key-here
```

---

## Step 2: Setup Bonsai Elasticsearch 🔍

- [ ] Sign up at [bonsai.io](https://bonsai.io)
- [ ] Create free "Sandbox" cluster (35MB)
- [ ] Copy full connection URL (includes credentials)
- [ ] Save for later

**Example**:
```
ELASTICSEARCH_URL=https://user:pass@cluster.bonsaisearch.net:443
```

---

## Step 3: Deploy Backend to Render 🚀

### Push to GitHub
```bash
cd /home/rohit/Public/assignments/reachinbox
git add .
git commit -m "Ready for deployment"
git push
```

### Deploy on Render.com
- [ ] Go to [render.com](https://render.com) and sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure:
  - **Name**: `reachinbox-backend`
  - **Environment**: Node
  - **Build Command**: `cd backend && npm install && npm run build`
  - **Start Command**: `cd backend && node dist/server.js`
  - **Plan**: Free

### Add Environment Variables
- [ ] Click "Advanced" → "Add Environment Variable"
- [ ] Add all variables (see DEPLOYMENT.md for full list):

**Required**:
```env
NODE_ENV=production
PORT=3000
ELASTICSEARCH_URL=<from-bonsai>
QDRANT_URL=<from-qdrant-cloud>
IMAP_HOST_1=imap.gmail.com
IMAP_PORT_1=993
IMAP_USER_1=<your-email>
IMAP_PASSWORD_1=<app-password>
IMAP_TLS_1=true
IMAP_HOST_2=imap.gmail.com
IMAP_PORT_2=993
IMAP_USER_2=<second-email>
IMAP_PASSWORD_2=<app-password>
IMAP_TLS_2=true
GEMINI_API_KEY=<from-google-ai-studio>
```

**Optional**:
```env
SLACK_WEBHOOK_URL=<your-slack-webhook>
WEBHOOK_URL=https://webhook.site/<your-id>
RAG_CONTEXT=I am applying for a job position...
```

- [ ] Click "Create Web Service"
- [ ] Wait 5-10 minutes for build
- [ ] Copy backend URL: `https://reachinbox-backend.onrender.com`
- [ ] Test: `curl https://reachinbox-backend.onrender.com/health`

---

## Step 4: Update Frontend Config 🎨

### Update API URL
```bash
# Update frontend/.env.production with your Render backend URL
echo "VITE_API_URL=https://reachinbox-backend.onrender.com" > frontend/.env.production

# Commit changes
git add frontend/.env.production
git commit -m "Update API URL for production"
git push
```

---

## Step 5: Deploy Frontend to Vercel 🌐

- [ ] Go to [vercel.com](https://vercel.com) and sign up with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - **Project Name**: `reachinbox-frontend`
  - **Framework**: Vite
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

### Add Environment Variable
- [ ] Add environment variable:
```env
VITE_API_URL=https://reachinbox-backend.onrender.com
```

- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Copy frontend URL: `https://reachinbox-frontend.vercel.app`

---

## Step 6: Update Backend CORS 🔒

- [ ] Go back to Render dashboard
- [ ] Add environment variable:
```env
FRONTEND_URL=https://reachinbox-frontend.vercel.app
```
- [ ] Trigger manual redeploy (top-right → "Manual Deploy" → "Deploy latest commit")

---

## Step 7: Test Everything ✅

### Test Backend
```bash
# Health check
curl https://reachinbox-backend.onrender.com/health

# Connection status (wait 30s for first request)
curl https://reachinbox-backend.onrender.com/api/emails/status/connections

# Search emails
curl "https://reachinbox-backend.onrender.com/api/emails/search?size=5"
```

### Test Frontend
- [ ] Open `https://reachinbox-frontend.vercel.app`
- [ ] Wait for backend to wake (first load ~30-50s)
- [ ] Check if emails appear
- [ ] Test search functionality
- [ ] Open email details
- [ ] Verify AI categories show
- [ ] Click "Generate Reply" button

### Test Integrations
- [ ] Send test email to one of your accounts
- [ ] Wait 30 seconds
- [ ] Refresh frontend - new email should appear
- [ ] Check if categorized correctly
- [ ] If "Interested", check Slack notification (if configured)
- [ ] If "Interested", check webhook.site (if configured)

---

## Step 8: Keep Backend Awake (Optional) ⏰

Use free ping service to prevent sleep:

### Option 1: UptimeRobot
- [ ] Go to [uptimerobot.com](https://uptimerobot.com)
- [ ] Add monitor:
  - **URL**: `https://reachinbox-backend.onrender.com/health`
  - **Interval**: 5 minutes

### Option 2: Cron-Job.org
- [ ] Go to [cron-job.org](https://cron-job.org)
- [ ] Create job:
  - **URL**: `https://reachinbox-backend.onrender.com/health`
  - **Schedule**: Every 14 minutes

---

## Step 9: Final Touches 📝

### Update README
- [ ] Add live demo links to README.md:
```markdown
## Live Demo

- **Frontend**: https://reachinbox-frontend.vercel.app
- **Backend API**: https://reachinbox-backend.onrender.com
- **API Health Check**: https://reachinbox-backend.onrender.com/health
```

### Commit Final Changes
```bash
git add README.md
git commit -m "Add live demo links"
git push
```

### Grant GitHub Access
- [ ] Go to GitHub repository → Settings → Collaborators
- [ ] Add user: `Mitrajit`

---

## Step 10: Record Demo Video 🎥

- [ ] Max 5 minutes
- [ ] Show live deployment URLs
- [ ] Demonstrate all 6 features:
  1. Real-time IMAP sync
  2. Elasticsearch search
  3. AI categorization
  4. Slack/webhook integration
  5. Frontend UI
  6. RAG-powered replies

---

## Step 11: Submit Assignment 📤

- [ ] Complete form: https://forms.gle/DqF27M4Sw1dJsf4j6
- [ ] Include:
  - GitHub repository link
  - Live frontend URL
  - Live backend URL
  - Demo video link (YouTube/Loom)

---

## Troubleshooting Common Issues

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Check Elasticsearch/Qdrant connection strings

### Frontend shows CORS error
- Verify FRONTEND_URL is set on Render
- Check backend CORS configuration in server.ts
- Redeploy backend after CORS changes

### Emails not syncing
- Check IMAP credentials in Render
- Verify Gmail app passwords (not regular passwords)
- Check backend logs for IMAP errors

### AI features not working
- Verify GEMINI_API_KEY is set correctly
- Check you haven't exceeded free tier rate limits (10/min)
- Review backend logs for API errors

---

## Your Deployment URLs

Fill in after deployment:

- **Frontend**: https://___________________.vercel.app
- **Backend**: https://___________________.onrender.com
- **Elasticsearch**: https://___________________.bonsaisearch.net
- **Qdrant**: https://___________________.aws.cloud.qdrant.io

---

## Estimated Time

- Setup cloud services: 15 minutes
- Deploy backend: 10 minutes
- Deploy frontend: 5 minutes
- Testing: 10 minutes
- **Total**: ~40 minutes

---

## Need Help?

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- Review service logs for errors
- Test locally first if issues persist

Good luck! 🚀

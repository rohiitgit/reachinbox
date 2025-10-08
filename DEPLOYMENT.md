# Free Deployment Guide

Complete guide to deploy Reachinbox Email Onebox on **100% FREE** hosting platforms.

## Free Hosting Stack

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Backend API | Render.com | 512MB RAM, sleeps after 15min |
| Frontend | Vercel | Unlimited bandwidth |
| Elasticsearch | Bonsai | 35MB storage |
| Qdrant Vector DB | Qdrant Cloud | 1GB cluster |
| **Total Cost** | | **$0/month** |

⚠️ **Limitations**:
- Backend sleeps after 15min inactivity (first request takes ~30-50s to wake)
- Elasticsearch limited to 35MB (good for ~5,000 emails)
- Suitable for demo/portfolio, not production

---

## Step 1: Setup Qdrant Cloud (Vector Database)

1. Go to [cloud.qdrant.io](https://cloud.qdrant.io)
2. Sign up (free, no credit card required)
3. Create a new cluster:
   - **Name**: `reachinbox-vectors`
   - **Region**: Choose closest to you
   - **Plan**: Free tier (1GB)
4. Click "Get API Key" → Copy the API key
5. Get cluster URL (format: `https://xyz.aws.cloud.qdrant.io:6333`)
6. **Save these for later**:
   ```
   QDRANT_URL=https://xyz.aws.cloud.qdrant.io:6333
   QDRANT_API_KEY=your-api-key
   ```

---

## Step 2: Setup Bonsai Elasticsearch

1. Go to [bonsai.io](https://bonsai.io)
2. Sign up → Select "Free Sandbox" plan
3. Create cluster:
   - **Name**: `reachinbox-search`
   - **Region**: Choose closest
   - **Version**: 8.x
4. Once created, get the connection URL:
   - Go to "Access" tab
   - Copy the full URL (includes username/password)
   - Format: `https://user:pass@cluster-name.us-east-1.bonsaisearch.net:443`
5. **Save for later**:
   ```
   ELASTICSEARCH_URL=https://user:pass@cluster.bonsaisearch.net:443
   ```

---

## Step 3: Deploy Backend to Render.com

### 3.1 Prepare Repository

1. **Commit all changes to Git**:
```bash
cd /home/rohit/Public/assignments/reachinbox
git add .
git commit -m "Prepare for deployment"
```

2. **Push to GitHub** (if not already):
```bash
# If you haven't created a repo yet
gh repo create reachinbox-onebox --private --source=. --remote=origin
git push -u origin main

# Or push to existing repo
git push
```

### 3.2 Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `reachinbox-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && node dist/server.js`
   - **Plan**: Free

6. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
```env
NODE_ENV=production
PORT=3000
ELASTICSEARCH_URL=https://user:pass@cluster.bonsaisearch.net:443
QDRANT_URL=https://xyz.aws.cloud.qdrant.io:6333

# IMAP Account 1
IMAP_HOST_1=imap.gmail.com
IMAP_PORT_1=993
IMAP_USER_1=your-email@gmail.com
IMAP_PASSWORD_1=your-app-password
IMAP_TLS_1=true

# IMAP Account 2
IMAP_HOST_2=imap.gmail.com
IMAP_PORT_2=993
IMAP_USER_2=second-email@gmail.com
IMAP_PASSWORD_2=your-app-password
IMAP_TLS_2=true

# API Keys
GEMINI_API_KEY=your-gemini-key

# Optional
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
WEBHOOK_URL=https://webhook.site/your-unique-id
RAG_CONTEXT=I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example
```

7. Click **"Create Web Service"**
8. Wait 5-10 minutes for deployment
9. **Copy your backend URL**: `https://reachinbox-backend.onrender.com`

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Update Frontend API URL

First, update the frontend to use the Render backend URL:

```bash
# Edit frontend/.env.production
echo "VITE_API_URL=https://reachinbox-backend.onrender.com" > frontend/.env.production
```

Or update `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://reachinbox-backend.onrender.com';
```

Commit changes:
```bash
git add .
git commit -m "Update frontend API URL for production"
git push
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..." → "Project"**
4. Import your GitHub repository
5. Configure:
   - **Project Name**: `reachinbox-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Environment Variables**:
```env
VITE_API_URL=https://reachinbox-backend.onrender.com
```
7. Click **"Deploy"**
8. Wait 2-3 minutes
9. **Copy your frontend URL**: `https://reachinbox-frontend.vercel.app`

---

## Step 5: Test Deployment

### 5.1 Test Backend
```bash
# Health check
curl https://reachinbox-backend.onrender.com/health

# Connection status
curl https://reachinbox-backend.onrender.com/api/emails/status/connections

# Search emails
curl "https://reachinbox-backend.onrender.com/api/emails/search?size=10"
```

### 5.2 Test Frontend
1. Open `https://reachinbox-frontend.vercel.app`
2. Wait for backend to wake up (~30s first time)
3. Check if emails load
4. Test search functionality
5. Verify AI categorization

---

## Step 6: Configure Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `reachinbox.yourdomain.com`)
3. Update DNS records as instructed

### For Render (Backend):
1. Go to Render Dashboard → Your Service → Settings → Custom Domain
2. Add domain (e.g., `api.reachinbox.yourdomain.com`)
3. Update DNS records

---

## Troubleshooting

### Backend Sleeps
**Issue**: First request takes 30-50 seconds

**Solutions**:
- Use [cron-job.org](https://cron-job.org) to ping `/health` every 14 minutes
- Add a loading message on frontend: "Waking up server..."
- Upgrade to Render paid plan ($7/month) for always-on

### CORS Errors
**Issue**: Frontend can't connect to backend

**Fix**: Ensure `cors()` is enabled in `backend/src/server.ts`:
```typescript
this.app.use(cors({
  origin: 'https://reachinbox-frontend.vercel.app'
}));
```

### Elasticsearch 35MB Limit
**Issue**: "Index full" error

**Solutions**:
- Delete old emails periodically
- Upgrade to paid Bonsai plan ($10/month)
- Use Elastic Cloud free trial (14 days)

### IMAP Connection Issues
**Issue**: Can't connect to email accounts

**Fix**:
- Verify Gmail app passwords are correct
- Check Render logs: Dashboard → Logs
- Some free tiers may block IMAP ports (rare)

---

## Keeping Backend Awake (Free Ping Service)

Use **UptimeRobot** or **Cron-Job.org** to prevent sleep:

### Using Cron-Job.org
1. Go to [cron-job.org](https://cron-job.org)
2. Sign up (free)
3. Create cronjob:
   - **Title**: Keep Reachinbox Awake
   - **URL**: `https://reachinbox-backend.onrender.com/health`
   - **Schedule**: Every 14 minutes
   - **Enable**: Yes
4. Save

Now your backend will stay awake during active hours!

---

## Production URLs

After deployment, you'll have:

- **Frontend**: `https://reachinbox-frontend.vercel.app`
- **Backend**: `https://reachinbox-backend.onrender.com`
- **API Docs**: `https://reachinbox-backend.onrender.com/health`

---

## Auto-Deploy Setup

Both Vercel and Render auto-deploy on `git push`:

1. Make changes locally
2. Commit: `git commit -m "Update feature"`
3. Push: `git push`
4. Watch deployments:
   - Vercel: Auto-deploys in ~2 mins
   - Render: Auto-deploys in ~5 mins

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Render.com | Free | $0 |
| Vercel | Hobby | $0 |
| Bonsai Elasticsearch | Sandbox | $0 |
| Qdrant Cloud | Free tier | $0 |
| **Total** | | **$0/month** |

### Upgrade Path (If Needed)

| Service | Paid Plan | Cost | Benefits |
|---------|-----------|------|----------|
| Render | Starter | $7/mo | No sleep, 512MB RAM |
| Bonsai | Growth | $10/mo | 100MB storage |
| Qdrant Cloud | Standard | $25/mo | 4GB cluster |
| **Total** | | **$42/mo** | Production-ready |

---

## Next Steps

1. ✅ Test all features on live deployment
2. ✅ Update README with live demo links
3. ✅ Record demo video using live URLs
4. ✅ Submit assignment with deployment URLs
5. ✅ Monitor logs for errors

---

## Support

- **Render Logs**: Dashboard → Your Service → Logs
- **Vercel Logs**: Dashboard → Your Project → Deployments → View Function Logs
- **Bonsai Logs**: Dashboard → Cluster → Logs
- **Qdrant Logs**: Dashboard → Cluster → Monitoring

Good luck! 🚀

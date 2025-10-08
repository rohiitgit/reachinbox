# 🚀 Deploy to Render.com RIGHT NOW

Follow these exact steps (10 minutes):

## Step 1: Push to GitHub

```bash
cd /home/rohit/Public/assignments/reachinbox
git add .
git commit -m "Ready for Render deployment"
git push
```

---

## Step 2: Create Render Web Service

1. Go to: https://render.com
2. Click **"Sign Up"** → Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Find and select your `reachinbox` repository
5. Click **"Connect"**

---

## Step 3: Configure Service

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `reachinbox-backend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | *Leave empty* |
| **Runtime** | `Node` |
| **Build Command** | `cd backend && npm install && npm run build` |
| **Start Command** | `cd backend && node dist/server.js` |
| **Instance Type** | **Free** |

---

## Step 4: Add Environment Variables

Click **"Advanced"** button → **"Add Environment Variable"**

### Option A: Copy one-by-one
Open [RENDER_ENV_VARS.txt](RENDER_ENV_VARS.txt) and copy each variable:

1. Click "+ Add Environment Variable"
2. Paste key name (e.g., `NODE_ENV`)
3. Paste value (e.g., `production`)
4. Repeat for all 18 variables

### Option B: Bulk Add (if available)
If Render shows "Add from .env" or bulk import:
1. Copy entire content from [RENDER_ENV_VARS.txt](RENDER_ENV_VARS.txt)
2. Paste into bulk import field

**Variables to add:**
```
NODE_ENV=production
PORT=3000
ELASTICSEARCH_URL=https://eddea59763:65a155314dbf10b7f3f4@reachinbox-1hchkj07.us-east-1.bonsaisearch.net
QDRANT_URL=https://02d153b4-ff39-4b6a-81ee-197ed95dc5b8.us-east4-0.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.caoWvuwXarTwSdo11Co_zS9nos7AMnheg1bre0pcIFA
IMAP_HOST_1=imap.gmail.com
IMAP_PORT_1=993
IMAP_USER_1=rohitcodes03@gmail.com
IMAP_PASSWORD_1=mxmovnlbdflfvvcz
IMAP_TLS_1=true
IMAP_HOST_2=imap.gmail.com
IMAP_PORT_2=993
IMAP_USER_2=vermarohit3875@gmail.com
IMAP_PASSWORD_2=unoczfcxpbwcgijg
IMAP_TLS_2=true
GEMINI_API_KEY=AIzaSyBTrFvEaQ6KYjCmQgf0RtyJD6sETHnhLug
SLACK_WEBHOOK_URL=your-slack-webhook-url
WEBHOOK_URL=https://webhook.site/ec57f894-2611-4305-84fc-4212bd6171de
RAG_CONTEXT=I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example
```

---

## Step 5: Deploy!

1. Scroll down and click **"Create Web Service"**
2. Wait 5-10 minutes while Render:
   - Clones your repo
   - Installs dependencies
   - Builds TypeScript
   - Starts server

Watch the logs in real-time!

---

## Step 6: Get Your Backend URL

Once deployed (status shows "Live"):
1. Copy your backend URL (top of dashboard)
   - Format: `https://reachinbox-backend.onrender.com`
2. **Save this URL** - you need it for frontend!

---

## Step 7: Test Backend

```bash
# Replace with YOUR URL
curl https://reachinbox-backend.onrender.com/health

# Should return:
# {"success":true,"message":"Reachinbox Email Onebox API is running","timestamp":"..."}
```

⏱️ **First request may take 30-50 seconds** (server is waking up)

---

## Step 8: Check Logs

If anything fails:
1. Go to Render Dashboard → Your Service → **"Logs"**
2. Look for errors
3. Common issues:
   - Missing env variables → Add them in Environment tab
   - Build errors → Check your code was pushed to GitHub
   - Port errors → Verify `PORT=3000` is set

---

## Next: Deploy Frontend to Vercel

Once backend is working:
1. Update `frontend/.env.production`:
   ```
   VITE_API_URL=https://reachinbox-backend.onrender.com
   ```
2. Push to GitHub
3. Follow Vercel deployment steps

---

## Quick Reference

**Render Dashboard**: https://dashboard.render.com
**Your Repo**: (add your GitHub URL)
**Environment Variables**: See [RENDER_ENV_VARS.txt](RENDER_ENV_VARS.txt)

---

## Troubleshooting

### Build fails
- Check logs for specific error
- Verify all dependencies in `package.json`
- Make sure code is pushed to GitHub

### Server won't start
- Check `Start Command` is correct
- Verify `PORT=3000` environment variable
- Look at logs for startup errors

### 404 errors
- Check `Root Directory` is empty
- Verify `buildCommand` has `cd backend`
- Make sure `dist/server.js` exists after build

---

**Your backend will be live at**: `https://reachinbox-backend.onrender.com`

Let's deploy! 🚀

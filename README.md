# Reachinbox - Feature-Rich Email Onebox

A highly functional email aggregator with real-time IMAP synchronization, AI-powered categorization, and intelligent reply suggestions using RAG (Retrieval-Augmented Generation).

## Features Implemented

### ✅ 1. Real-Time Email Synchronization
- **Multiple IMAP accounts**: Supports 2+ accounts simultaneously
- **30-day email history**: Fetches and indexes last 30 days of emails
- **Persistent IDLE connections**: Real-time updates without polling or cron jobs
- **Auto-reconnection**: Automatic reconnection on connection loss

### ✅ 2. Searchable Storage using Elasticsearch
- **Docker-hosted Elasticsearch**: Fully indexed email storage
- **Advanced search**: Full-text search across subject, body, sender
- **Filtering**: Filter by account, folder, and category
- **High performance**: Optimized queries with pagination

### ✅ 3. AI-Based Email Categorization
Automatic categorization using **Google Gemini 2.5 Flash Lite** (free tier) into:
- **Interested**: Sender showing interest in product/service
- **Meeting Booked**: Meeting confirmation or scheduling
- **Not Interested**: Explicit decline or disinterest
- **Spam**: Promotional or unsolicited emails
- **Out of Office**: Auto-reply messages

### ✅ 4. Slack & Webhook Integration
- **Slack notifications**: Rich formatted messages for "Interested" emails
- **Webhook triggers**: POST requests to webhook.site for automation
- **Event-driven**: Automatic triggers on email categorization

### ✅ 5. Frontend Interface
- **Modern React UI**: Clean, responsive design
- **Real-time updates**: Auto-refresh every 30 seconds
- **Advanced filtering**: Search by account, folder, category
- **Email preview**: Full email viewing with HTML support
- **Connection status**: Live IMAP connection monitoring

### ✅ 6. AI-Powered Suggested Replies (RAG)
- **Vector database**: Qdrant for context storage
- **Context-aware**: Uses stored outreach agenda
- **LLM-powered**: Google Gemini 2.5 Flash Lite for reply generation
- **Embeddings**: Google's embedding-001 model (768 dimensions)
- **Automatic suggestions**: Generated for "Interested" emails
- **On-demand generation**: Manual trigger available

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐                │
│  │ Email    │  │ Search   │  │ AI Reply   │                │
│  │ List     │  │ Filter   │  │ Suggestion │                │
│  └──────────┘  └──────────┘  └────────────┘                │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│                   Backend (Node.js + TypeScript)             │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │ IMAP     │  │ AI       │  │ RAG        │  │ Webhook  │ │
│  │ Service  │──│ Category │──│ Service    │  │ Service  │ │
│  │ (IDLE)   │  │ Service  │  │            │  └──────────┘ │
│  └──────────┘  └──────────┘  └────────────┘                │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────┐
        │                 │                 │             │
┌───────▼──────┐  ┌───────▼──────┐  ┌──────▼─────┐  ┌───▼────┐
│Elasticsearch │  │   Qdrant     │  │  Slack     │  │ IMAP   │
│  (Search &   │  │  (Vector DB  │  │  Webhook   │  │Servers │
│   Storage)   │  │   for RAG)   │  │            │  │        │
└──────────────┘  └──────────────┘  └────────────┘  └────────┘
```

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **IMAP**: `imap` library with IDLE support
- **Email Parsing**: `mailparser`
- **Search**: Elasticsearch 8.11
- **Vector DB**: Qdrant
- **AI**: Google Gemini API (gemini-2.5-flash-lite, embedding-001)
  - **Why Gemini?** Free tier with generous limits, state-of-the-art performance, no credit card required
- **Notifications**: Slack Webhook, Axios

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: Inline CSS-in-JS

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Search Engine**: Elasticsearch
- **Vector Database**: Qdrant

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Email accounts with IMAP access (Gmail recommended)
- Google Gemini API key (free tier available)
- Slack webhook URL (optional)

### 1. Clone Repository
```bash
git clone <repository-url>
cd reachinbox
```

### 2. Setup Environment Variables
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# IMAP Account 1 (Gmail example)
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

# Google Gemini API Key (Free tier available)
GEMINI_API_KEY=AIza...

# Slack Webhook (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Webhook URL (use webhook.site)
WEBHOOK_URL=https://webhook.site/your-unique-id

# RAG Context (customize for your use case)
RAG_CONTEXT=I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example
```

**Gmail Setup:**
1. Enable IMAP in Gmail Settings
2. Enable 2-Factor Authentication
3. Generate App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Use the app password in `.env`

**Gemini API Setup:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key (free tier available)
3. Copy the key and add to `.env`
4. Free tier: 10 requests/min for gemini-2.5-flash-lite

### 3. Start Docker Services
```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps
```

Wait ~30 seconds for Elasticsearch to be ready.

### 4. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:3000`

### 5. Install & Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

### 6. Test with Postman

Import the following endpoints:

#### GET `/api/emails/search`
Search emails with filters
```
GET http://localhost:3000/api/emails/search?q=interview&category=Interested
```

#### GET `/api/emails/:id`
Get email by ID
```
GET http://localhost:3000/api/emails/<email-id>
```

#### POST `/api/emails/:id/reply`
Generate AI reply
```
POST http://localhost:3000/api/emails/<email-id>/reply
```

#### GET `/api/emails/status/connections`
Check IMAP connection status
```
GET http://localhost:3000/api/emails/status/connections
```

#### GET `/api/emails/stats/overview`
Get email statistics
```
GET http://localhost:3000/api/emails/stats/overview
```

## API Documentation

### Search Emails
```http
GET /api/emails/search
Query Parameters:
  - q: Search query (optional)
  - accountId: Filter by account (optional)
  - folder: Filter by folder (optional)
  - category: Filter by category (optional)
  - from: Pagination offset (default: 0)
  - size: Results per page (default: 50)
```

### Get Email by ID
```http
GET /api/emails/:id
```

### Update Email Category
```http
PATCH /api/emails/:id/category
Body: { "category": "Interested" }
```

### Generate AI Reply
```http
POST /api/emails/:id/reply
```

### Get Connection Status
```http
GET /api/emails/status/connections
```

### Get Statistics
```http
GET /api/emails/stats/overview
```

### Add Custom Context
```http
POST /api/emails/context/add
Body: {
  "context": "Product information...",
  "metadata": { "type": "product" }
}
```

## How It Works

### 1. IMAP Synchronization
- Establishes persistent IMAP connections using IDLE mode
- Fetches last 30 days of emails on startup
- Listens for new emails in real-time
- Auto-reconnects on connection loss

### 2. Email Processing Pipeline
```
New Email → Parse → AI Categorization → RAG Reply (if Interested)
         → Index in Elasticsearch → Notify Slack/Webhook
```

### 3. AI Categorization
- Uses Google Gemini 2.5 Flash Lite with custom prompt
- Analyzes subject and body
- Returns one of 5 categories
- Free tier: 10 requests/minute

### 4. RAG Reply Generation
- Stores context in Qdrant vector database
- Creates embeddings using Google's embedding-001 model (768 dimensions)
- Retrieves relevant context for each email
- Generates contextual reply with Gemini 2.5 Flash Lite

### 5. Search & Filtering
- Full-text search in Elasticsearch
- Multi-field matching (subject, body, sender)
- Filter by account, folder, category
- Sorted by date (newest first)

## Feature Highlights

### Real-Time Sync (No Cron!)
✅ Uses IMAP IDLE protocol for instant updates
✅ Persistent connections with keepalive
✅ Auto-reconnection with exponential backoff

### AI Categorization
✅ 5 distinct categories
✅ Context-aware classification
✅ Automatic categorization on receipt

### RAG-Powered Replies
✅ Vector database for context storage
✅ Semantic search for relevant context
✅ Personalized, context-aware replies
✅ Auto-generated for "Interested" emails

### Integrations
✅ Rich Slack notifications
✅ Webhook automation
✅ Triggered only for "Interested" emails

### Frontend
✅ Clean, modern UI
✅ Real-time updates
✅ Advanced filtering
✅ Email preview with HTML support
✅ Connection status monitoring

## Project Structure

```
reachinbox/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── services/         # Business logic
│   │   │   ├── imap.service.ts
│   │   │   ├── elasticsearch.service.ts
│   │   │   ├── ai-categorization.service.ts
│   │   │   ├── rag.service.ts
│   │   │   ├── slack.service.ts
│   │   │   └── webhook.service.ts
│   │   ├── models/           # TypeScript interfaces
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Route handlers
│   │   └── server.ts         # Main server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Main app
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml        # Docker services
└── README.md
```

## Troubleshooting

### Elasticsearch not starting
```bash
# Check logs
docker-compose logs elasticsearch

# Increase memory (if needed)
# Edit docker-compose.yml: ES_JAVA_OPTS=-Xms1g -Xmx1g
```

### IMAP connection fails
- Verify credentials in `.env`
- For Gmail: Use app password, not regular password
- Check IMAP is enabled in email settings
- Verify firewall allows port 993

### AI categorization not working
- Verify Gemini API key is valid (from https://aistudio.google.com/app/apikey)
- Check rate limits (10 requests/min on free tier)
- Emails marked "Uncategorized" when rate limited
- Review backend logs for errors
- Rate limits reset automatically every minute

### Frontend not loading emails
- Verify backend is running on port 3000
- Check browser console for errors
- Ensure Elasticsearch is healthy

## Performance Notes

- **Initial sync**: ~1-5 minutes for 30 days of emails (depends on email count)
- **Real-time updates**: Instant (IMAP IDLE)
- **Search**: <100ms for most queries
- **AI categorization**: ~1-2s per email
- **RAG reply generation**: ~2-3s

## Security Considerations

- ✅ Credentials stored in `.env` (not committed)
- ✅ IMAP uses TLS encryption
- ✅ Elasticsearch runs locally (not exposed)
- ✅ API keys validated before use
- ⚠️ Production deployment needs additional security:
  - JWT authentication
  - HTTPS/SSL certificates
  - Rate limiting
  - Input validation/sanitization

## Scalability

### Current Setup (Development)
- 2 IMAP accounts
- ~10,000 emails
- Single Elasticsearch node
- Single Qdrant instance

### Production Improvements
- Horizontal scaling with load balancer
- Elasticsearch cluster (3+ nodes)
- Redis for caching
- Message queue (RabbitMQ/Kafka) for async processing
- Separate AI service for categorization
- Database for user management

## Testing

### Manual Testing with Postman
1. Test all API endpoints
2. Verify search functionality
3. Check AI categorization
4. Test RAG reply generation
5. Verify webhook triggers

### Send Test Emails
1. Send emails to configured accounts
2. Wait ~5-10 seconds for sync
3. Check frontend for new emails
4. Verify categorization
5. Check Slack/webhook notifications

## Deployment

### Free Hosting (100% Free)

Deploy this application for **$0/month** using:
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel (Free tier)
- **Elasticsearch**: Bonsai (Free 35MB)
- **Qdrant**: Qdrant Cloud (Free 1GB)

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide
✅ **See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** for step-by-step checklist

### Quick Deploy

```bash
# Run deployment helper
./deploy.sh

# Then follow the guide in DEPLOYMENT.md
```

### Live Demo URLs

Once deployed, add your URLs here:
- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-app.onrender.com
- **API Docs**: https://your-app.onrender.com/health

## Demo Video

[Link to demo video - max 5 minutes]

## Submission Checklist

- ✅ All 6 features implemented
- ✅ Backend tested with Postman
- ✅ Frontend fully functional
- ✅ Real-time IMAP sync (no cron)
- ✅ Elasticsearch integration
- ✅ AI categorization
- ✅ Slack/webhook integration
- ✅ RAG-powered replies
- ✅ Clean, documented code
- ✅ Comprehensive README
- ✅ Docker setup
- ✅ TypeScript throughout

## Credits

Built by [Your Name] for Reachinbox Backend Engineering Assignment

## License

MIT

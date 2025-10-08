# Reachinbox - Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           React Frontend (Port 5173)                      │   │
│  │  - Email List View                                        │   │
│  │  - Search & Filter UI                                     │   │
│  │  - Email Detail View                                      │   │
│  │  - AI Reply Display                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                    Application Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        Node.js + Express Backend (Port 3000)             │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐       │   │
│  │  │ Controllers│  │   Routes   │  │  Middleware │       │   │
│  │  └────────────┘  └────────────┘  └─────────────┘       │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              Service Layer                        │   │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │   │
│  │  │  │   IMAP   │  │   AI     │  │   RAG    │       │   │   │
│  │  │  │  Service │  │Categorize│  │  Service │       │   │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘       │   │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │   │
│  │  │  │Elasticsearch│ │  Slack  │  │ Webhook  │       │   │   │
│  │  │  │  Service │  │  Service │  │  Service │       │   │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬─────────────┐
        │                   │                   │             │
┌───────▼──────┐    ┌───────▼──────┐    ┌──────▼─────┐  ┌───▼────┐
│              │    │              │    │            │  │        │
│Elasticsearch │    │   Qdrant     │    │   Slack    │  │  IMAP  │
│   (9200)     │    │   (6333)     │    │  Webhook   │  │Servers │
│              │    │              │    │            │  │        │
│ - Email Index│    │ - Vectors    │    │ - POST     │  │ Gmail  │
│ - Search     │    │ - Context    │    │   Events   │  │ Others │
│ - Filters    │    │ - Retrieval  │    │            │  │        │
└──────────────┘    └──────────────┘    └────────────┘  └────────┘
```

## Component Architecture

### 1. IMAP Service (`imap.service.ts`)

**Responsibilities:**
- Manage persistent IMAP connections
- Implement IDLE mode for real-time sync
- Parse incoming emails
- Trigger processing pipeline

**Key Features:**
```typescript
class ImapService {
  // Persistent connections per account
  private connections: Map<string, Imap>

  // Initialize all IMAP accounts
  async initialize()

  // Setup IDLE mode for real-time updates
  private setupIdleMode(imap, accountId)

  // Fetch last 30 days of emails
  private async fetchRecentEmails(imap, accountId)

  // Process new email
  private async handleParsedEmail(parsed, uid, accountId, folder)
}
```

**IDLE Mode Implementation:**
```
1. Connect to IMAP server
2. Open INBOX folder
3. Start IDLE mode
4. Listen for 'mail' event
5. Fetch new emails on event
6. Restart IDLE every 29 minutes
7. Auto-reconnect on disconnect
```

**Data Flow:**
```
IMAP Server → IDLE Event → Fetch Email → Parse → Pipeline
                                           ↓
                               AI Categorization
                                           ↓
                               RAG (if Interested)
                                           ↓
                               Index in Elasticsearch
                                           ↓
                               Notify (Slack/Webhook)
```

### 2. Elasticsearch Service (`elasticsearch.service.ts`)

**Responsibilities:**
- Index emails for fast search
- Provide search and filtering
- Manage email storage

**Schema:**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "accountId": { "type": "keyword" },
      "folder": { "type": "keyword" },
      "from": {
        "properties": {
          "name": { "type": "text" },
          "address": { "type": "keyword" }
        }
      },
      "subject": { "type": "text" },
      "body": { "type": "text" },
      "date": { "type": "date" },
      "category": { "type": "keyword" },
      "suggestedReply": { "type": "text" }
    }
  }
}
```

**Search Features:**
- Full-text search (subject, body, sender)
- Filter by account, folder, category
- Pagination
- Sorted by date (newest first)

### 3. AI Categorization Service (`ai-categorization.service.ts`)

**Model:** OpenAI GPT-3.5-turbo

**Prompt Engineering:**
```
System: You are an expert email categorization system

User: Analyze this email and categorize:
Categories: Interested, Meeting Booked, Not Interested, Spam, Out of Office

Email Subject: [subject]
Email Body: [body]

Respond with ONLY the category name.
```

**Parameters:**
- Temperature: 0.3 (low for consistency)
- Max tokens: 50
- Model: gpt-3.5-turbo

**Category Mapping:**
```typescript
enum EmailCategory {
  INTERESTED = 'Interested',
  MEETING_BOOKED = 'Meeting Booked',
  NOT_INTERESTED = 'Not Interested',
  SPAM = 'Spam',
  OUT_OF_OFFICE = 'Out of Office',
  UNCATEGORIZED = 'Uncategorized'
}
```

### 4. RAG Service (`rag.service.ts`)

**Components:**
- Vector Database: Qdrant
- Embedding Model: text-embedding-ada-002
- LLM: GPT-3.5-turbo

**Architecture:**
```
Context Storage:
1. Convert context text to embeddings (1536 dimensions)
2. Store in Qdrant with metadata
3. Create searchable vector index

Reply Generation:
1. Convert email body to embedding
2. Search Qdrant for similar contexts (top-k=3)
3. Retrieve relevant context
4. Build prompt with context + email
5. Generate reply with GPT-3.5-turbo
```

**Vector Schema:**
```typescript
{
  id: string,
  vector: number[], // 1536 dimensions
  payload: {
    text: string,
    type: string,
    metadata: object
  }
}
```

**RAG Pipeline:**
```
Email → Embed → Search Qdrant → Retrieve Context
                                      ↓
                          Build Prompt with Context
                                      ↓
                          GPT-3.5 Generate Reply
                                      ↓
                          Return Suggested Reply
```

### 5. Integration Services

#### Slack Service (`slack.service.ts`)
```typescript
class SlackService {
  async sendInterestedNotification(email: Email) {
    // Rich formatted message with:
    // - From name/address
    // - Subject
    // - Preview (200 chars)
    // - Account ID
    // - Date
  }
}
```

#### Webhook Service (`webhook.service.ts`)
```typescript
class WebhookService {
  async triggerInterestedWebhook(email: Email) {
    POST webhook.site {
      event: 'email.interested',
      timestamp: ISO string,
      data: {
        id, accountId, from, subject, body, date, category
      }
    }
  }
}
```

## Data Models

### Email Model
```typescript
interface Email {
  id: string;              // "account_1_12345"
  accountId: string;       // "account_1"
  folder: string;          // "INBOX"
  from: {
    name?: string;
    address: string;
  };
  to: Array<{
    name?: string;
    address: string;
  }>;
  subject: string;
  body: string;            // Plain text
  html?: string;           // HTML content
  date: Date;
  uid: number;             // IMAP UID
  category?: EmailCategory;
  suggestedReply?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Search Query
```typescript
interface SearchQuery {
  query?: string;          // Full-text search
  accountId?: string;      // Filter by account
  folder?: string;         // Filter by folder
  category?: EmailCategory;// Filter by category
  from?: number;           // Pagination offset
  size?: number;           // Results per page
}
```

## API Endpoints

### GET `/api/emails/search`
**Purpose:** Search and filter emails
**Query Params:**
- `q`: Search query
- `accountId`: Filter by account
- `folder`: Filter by folder
- `category`: Filter by category
- `from`: Pagination offset
- `size`: Results per page

**Response:**
```json
{
  "success": true,
  "data": [Email],
  "total": 1234,
  "from": 0,
  "size": 50
}
```

### GET `/api/emails/:id`
**Purpose:** Get single email by ID

### POST `/api/emails/:id/reply`
**Purpose:** Generate AI suggested reply

### GET `/api/emails/status/connections`
**Purpose:** Check IMAP connection status

### GET `/api/emails/stats/overview`
**Purpose:** Get email statistics by category

## Performance Optimizations

### 1. IMAP Connection Management
- Persistent connections (no reconnection per email)
- Keepalive with NOOP commands
- Auto-reconnect on failure
- Connection pooling per account

### 2. Elasticsearch Indexing
- Bulk indexing for initial sync
- Async indexing for new emails
- Optimized mappings (keyword vs text)
- Index refresh interval: 1s

### 3. AI Processing
- Async categorization
- Batch processing for multiple emails
- Error handling with fallback to UNCATEGORIZED
- Rate limiting (if needed)

### 4. Frontend Optimizations
- Auto-refresh every 30s (not real-time polling)
- Pagination (50 emails per page)
- Lazy loading email details
- Cached search results

## Security Considerations

### Current Implementation
✅ TLS for IMAP connections
✅ Environment variables for secrets
✅ No credentials in code
✅ Local Elasticsearch (not exposed)

### Production Requirements
- [ ] JWT authentication
- [ ] HTTPS/SSL certificates
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation (joi/zod)
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CORS configuration
- [ ] Helmet.js security headers

## Scalability Path

### Current Setup (Development)
- Single Node.js instance
- Single Elasticsearch node
- Single Qdrant instance
- 2 IMAP accounts
- ~10K emails

### Scale to 10 Accounts, 100K Emails
- Load balancer (Nginx)
- 2-3 Node.js instances
- 3-node Elasticsearch cluster
- Redis for caching
- Message queue for async processing

### Scale to 100+ Accounts, Millions of Emails
- Kubernetes cluster
- Horizontal pod autoscaling
- Elasticsearch cluster (5+ nodes)
- Separate AI service
- CDN for frontend
- Database sharding
- Microservices architecture

## Error Handling

### IMAP Errors
- Connection timeout → Auto-reconnect
- Authentication failure → Log and skip account
- Network error → Retry with exponential backoff

### Elasticsearch Errors
- Index not found → Auto-create
- Connection error → Retry
- Mapping error → Log and continue

### AI API Errors
- Rate limit → Queue and retry
- Invalid response → Fallback to UNCATEGORIZED
- Network error → Retry 3 times

## Monitoring & Logging

### Current Logging
- Console logs for all services
- Error stack traces
- IMAP events
- Email processing pipeline

### Production Monitoring
- Winston/Bunyan for structured logging
- ELK stack for log aggregation
- Prometheus + Grafana for metrics
- Sentry for error tracking
- APM (Application Performance Monitoring)

## Testing Strategy

### Unit Tests
- Service layer methods
- Email parsing logic
- Search query building
- Category mapping

### Integration Tests
- IMAP connection
- Elasticsearch indexing
- AI API calls
- RAG pipeline

### E2E Tests
- Full email sync flow
- Search and filter
- AI categorization
- Reply generation
- Webhook triggers

## Deployment

### Development
```bash
docker-compose up -d
cd backend && npm run dev
cd frontend && npm run dev
```

### Production
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
# Serve dist/ with Nginx

# Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Future Enhancements

1. **Multi-folder support**: Beyond INBOX
2. **Email sending**: Reply directly from UI
3. **Attachments**: Download and view
4. **Labels/Tags**: Custom organization
5. **Rules engine**: Auto-categorization rules
6. **Analytics dashboard**: Email insights
7. **Team collaboration**: Shared inbox
8. **Mobile app**: React Native
9. **Browser extension**: Quick access
10. **Advanced AI**: Fine-tuned models

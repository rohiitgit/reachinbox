import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    index: 'emails'
  },

  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || '',
    collection: 'email_contexts'
  },

  imap: {
    accounts: [
      {
        id: 'account_1',
        host: process.env.IMAP_HOST_1 || '',
        port: parseInt(process.env.IMAP_PORT_1 || '993'),
        user: process.env.IMAP_USER_1 || '',
        password: process.env.IMAP_PASSWORD_1 || '',
        tls: process.env.IMAP_TLS_1 === 'true',
        tlsOptions: { rejectUnauthorized: false }
      },
      {
        id: 'account_2',
        host: process.env.IMAP_HOST_2 || '',
        port: parseInt(process.env.IMAP_PORT_2 || '993'),
        user: process.env.IMAP_USER_2 || '',
        password: process.env.IMAP_PASSWORD_2 || '',
        tls: process.env.IMAP_TLS_2 === 'true',
        tlsOptions: { rejectUnauthorized: false }
      }
    ],
    syncDays: 30
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  },

  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || ''
  },

  webhook: {
    url: process.env.WEBHOOK_URL || ''
  },

  rag: {
    context: process.env.RAG_CONTEXT || 'I am applying for a job position. If the lead is interested, share the meeting booking link: https://cal.com/example'
  }
};

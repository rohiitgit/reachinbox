import Imap from 'imap';
import { simpleParser, ParsedMail, AddressObject } from 'mailparser';
import { config } from '../config';
import { Email, EmailCategory, ImapConfig } from '../models/email.model';
import { elasticsearchService } from './elasticsearch.service';
import { aiCategorizationService } from './ai-categorization.service';
import { slackService } from './slack.service';
import { webhookService } from './webhook.service';
import { ragService } from './rag.service';

export class ImapService {
  private connections: Map<string, Imap> = new Map();
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('IMAP service already initialized');
      return;
    }

    for (const account of config.imap.accounts) {
      if (!account.user || !account.password) {
        console.warn(`Skipping account ${account.id} - missing credentials`);
        continue;
      }

      try {
        await this.connectAccount(account);
      } catch (error) {
        console.error(`Error connecting account ${account.id}:`, error);
      }
    }

    this.isInitialized = true;
    console.log('IMAP service initialized successfully');
  }

  private async connectAccount(account: ImapConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: account.user,
        password: account.password,
        host: account.host,
        port: account.port,
        tls: account.tls,
        tlsOptions: account.tlsOptions,
        keepalive: {
          interval: 10000,
          idleInterval: 300000,
          forceNoop: true
        }
      });

      imap.once('ready', async () => {
        console.log(`IMAP connection ready for account: ${account.id}`);
        this.connections.set(account.id, imap);

        // Fetch last 30 days of emails
        await this.fetchRecentEmails(imap, account.id);

        // Setup IDLE mode for real-time updates
        this.setupIdleMode(imap, account.id);

        resolve();
      });

      imap.once('error', (err: Error) => {
        console.error(`IMAP connection error for account ${account.id}:`, err);
        reject(err);
      });

      imap.once('end', () => {
        console.log(`IMAP connection ended for account ${account.id}`);
        this.connections.delete(account.id);

        // Reconnect after 5 seconds
        setTimeout(() => {
          console.log(`Reconnecting account ${account.id}...`);
          this.connectAccount(account).catch(console.error);
        }, 5000);
      });

      imap.connect();
    });
  }

  private async fetchRecentEmails(imap: Imap, accountId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error(`Error opening INBOX for ${accountId}:`, err);
          return reject(err);
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - config.imap.syncDays);

        const searchCriteria = [['SINCE', thirtyDaysAgo]];

        imap.search(searchCriteria, (err, results) => {
          if (err) {
            console.error(`Error searching emails for ${accountId}:`, err);
            return reject(err);
          }

          if (results.length === 0) {
            console.log(`No recent emails found for ${accountId}`);
            return resolve();
          }

          console.log(`Found ${results.length} emails for ${accountId}`);

          const fetch = imap.fetch(results, {
            bodies: '',
            struct: true,
            markSeen: false
          });

          fetch.on('message', (msg, seqno) => {
            this.processMessage(msg, seqno, accountId, 'INBOX');
          });

          fetch.once('error', (err) => {
            console.error(`Fetch error for ${accountId}:`, err);
            reject(err);
          });

          fetch.once('end', () => {
            console.log(`Finished fetching emails for ${accountId}`);
            resolve();
          });
        });
      });
    });
  }

  private setupIdleMode(imap: Imap, accountId: string): void {
    imap.openBox('INBOX', false, (err) => {
      if (err) {
        console.error(`Error opening INBOX for IDLE mode (${accountId}):`, err);
        return;
      }

      console.log(`IDLE mode activated for ${accountId}`);

      imap.on('mail', (numNewMsgs: number) => {
        console.log(`${numNewMsgs} new email(s) received for ${accountId}`);
        this.fetchNewEmails(imap, accountId);
      });

      // IDLE mode not available in this IMAP library
      // Using 'mail' event listener instead for new email notifications
      console.log(`IDLE mode activated for ${accountId}`);
    });
  }

  private async fetchNewEmails(imap: Imap, accountId: string): Promise<void> {
    imap.search(['UNSEEN'], (err, results) => {
      if (err) {
        console.error(`Error searching new emails for ${accountId}:`, err);
        return;
      }

      if (results.length === 0) {
        return;
      }

      const fetch = imap.fetch(results, {
        bodies: '',
        struct: true,
        markSeen: false
      });

      fetch.on('message', (msg, seqno) => {
        this.processMessage(msg, seqno, accountId, 'INBOX');
      });

      fetch.once('error', (err) => {
        console.error(`Fetch error for new emails (${accountId}):`, err);
      });
    });
  }

  private processMessage(msg: any, seqno: number, accountId: string, folder: string): void {
    let uid: number = 0;
    let buffer: Buffer = Buffer.from('');

    msg.on('body', (stream: any) => {
      let chunk: Buffer;
      stream.on('data', (data: Buffer) => {
        chunk = data;
        buffer = Buffer.concat([buffer, chunk]);
      });
    });

    msg.once('attributes', (attrs: any) => {
      uid = attrs.uid;
    });

    msg.once('end', async () => {
      try {
        const parsed = await simpleParser(buffer);
        await this.handleParsedEmail(parsed, uid, accountId, folder);
      } catch (error) {
        console.error(`Error parsing email (${accountId}, UID: ${uid}):`, error);
      }
    });
  }

  private async handleParsedEmail(
    parsed: ParsedMail,
    uid: number,
    accountId: string,
    folder: string
  ): Promise<void> {
    try {
      // Check if email already exists
      const exists = await elasticsearchService.emailExists(accountId, uid);
      if (exists) {
        console.log(`Email already indexed (${accountId}, UID: ${uid})`);
        return;
      }

      const emailId = `${accountId}_${uid}`;
      const body = parsed.text || parsed.html || '';
      const subject = parsed.subject || '(No Subject)';

      // Categorize email using AI
      const category = await aiCategorizationService.categorizeEmail(subject, body);

      // Generate suggested reply using RAG
      let suggestedReply = '';
      if (category === EmailCategory.INTERESTED) {
        suggestedReply = await ragService.generateSuggestedReply(subject, body);
      }

      const email: Email = {
        id: emailId,
        accountId,
        folder,
        from: {
          name: parsed.from?.value[0]?.name,
          address: parsed.from?.value[0]?.address || ''
        },
        to: (Array.isArray(parsed.to) ? parsed.to : parsed.to?.value || []).map((addr: any) => ({
          name: addr.name,
          address: addr.address || ''
        })),
        subject,
        body,
        html: parsed.html || undefined,
        date: parsed.date || new Date(),
        uid,
        category,
        suggestedReply,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Index email in Elasticsearch
      await elasticsearchService.indexEmail(email);

      // Send notifications for interested emails
      if (category === EmailCategory.INTERESTED) {
        await Promise.all([
          slackService.sendInterestedNotification(email),
          webhookService.triggerInterestedWebhook(email)
        ]);
      }

      console.log(`Email processed successfully: ${emailId} [${category}]`);
    } catch (error) {
      console.error(`Error handling parsed email (${accountId}, UID: ${uid}):`, error);
    }
  }

  getConnectionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const account of config.imap.accounts) {
      status[account.id] = this.connections.has(account.id);
    }
    return status;
  }

  async disconnect(): Promise<void> {
    for (const [accountId, imap] of this.connections.entries()) {
      imap.end();
      console.log(`Disconnected account: ${accountId}`);
    }
    this.connections.clear();
    this.isInitialized = false;
  }
}

export const imapService = new ImapService();

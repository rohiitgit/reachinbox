import axios from 'axios';
import { config } from '../config';
import { Email } from '../models/email.model';

export class WebhookService {
  async triggerInterestedWebhook(email: Email): Promise<void> {
    if (!config.webhook.url) {
      console.warn('Webhook URL not configured');
      return;
    }

    try {
      const payload = {
        event: 'email.interested',
        timestamp: new Date().toISOString(),
        data: {
          id: email.id,
          accountId: email.accountId,
          from: email.from,
          subject: email.subject,
          body: email.body,
          date: email.date,
          category: email.category
        }
      };

      await axios.post(config.webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`Webhook triggered for email ${email.id}`);
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  }
}

export const webhookService = new WebhookService();

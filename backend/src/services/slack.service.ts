import { IncomingWebhook } from '@slack/webhook';
import { config } from '../config';
import { Email } from '../models/email.model';

export class SlackService {
  private webhook: IncomingWebhook | null = null;

  constructor() {
    if (config.slack.webhookUrl) {
      this.webhook = new IncomingWebhook(config.slack.webhookUrl);
    }
  }

  async sendInterestedNotification(email: Email): Promise<void> {
    if (!this.webhook) {
      console.warn('Slack webhook not configured');
      return;
    }

    try {
      await this.webhook.send({
        text: '🎯 New Interested Email Received!',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎯 New Interested Email',
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*From:*\n${email.from.name || email.from.address}`
              },
              {
                type: 'mrkdwn',
                text: `*Account:*\n${email.accountId}`
              },
              {
                type: 'mrkdwn',
                text: `*Subject:*\n${email.subject}`
              },
              {
                type: 'mrkdwn',
                text: `*Date:*\n${new Date(email.date).toLocaleString()}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Preview:*\n${email.body.substring(0, 200)}${email.body.length > 200 ? '...' : ''}`
            }
          }
        ]
      });

      console.log(`Slack notification sent for email ${email.id}`);
    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }
}

export const slackService = new SlackService();

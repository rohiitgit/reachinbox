import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { EmailCategory } from '../models/email.model';

export class AiCategorizationService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async categorizeEmail(subject: string, body: string): Promise<EmailCategory> {
    try {
      const prompt = `You are an expert email categorization system. Analyze the following email and categorize it into ONE of these categories:
- Interested: The sender is showing interest in a product, service, or opportunity
- Meeting Booked: The email confirms or schedules a meeting
- Not Interested: The sender explicitly declines or shows no interest
- Spam: The email is promotional, unsolicited, or irrelevant
- Out of Office: Auto-reply indicating the person is away

Email Subject: ${subject}
Email Body: ${body}

Respond with ONLY the category name, nothing else.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const category = response.text().trim();

      // Map response to enum
      switch (category.toLowerCase()) {
        case 'interested':
          return EmailCategory.INTERESTED;
        case 'meeting booked':
          return EmailCategory.MEETING_BOOKED;
        case 'not interested':
          return EmailCategory.NOT_INTERESTED;
        case 'spam':
          return EmailCategory.SPAM;
        case 'out of office':
          return EmailCategory.OUT_OF_OFFICE;
        default:
          return EmailCategory.UNCATEGORIZED;
      }
    } catch (error) {
      console.error('Error categorizing email:', error);
      return EmailCategory.UNCATEGORIZED;
    }
  }

  async categorizeEmailBatch(emails: Array<{ subject: string; body: string }>): Promise<EmailCategory[]> {
    const categories = await Promise.all(
      emails.map(email => this.categorizeEmail(email.subject, email.body))
    );
    return categories;
  }
}

export const aiCategorizationService = new AiCategorizationService();

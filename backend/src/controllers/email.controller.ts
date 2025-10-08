import { Request, Response } from 'express';
import { elasticsearchService } from '../services/elasticsearch.service';
import { imapService } from '../services/imap.service';
import { ragService } from '../services/rag.service';
import { SearchQuery } from '../models/email.model';

export class EmailController {
  async searchEmails(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchQuery = {
        query: req.query.q as string,
        accountId: req.query.accountId as string,
        folder: req.query.folder as string,
        category: req.query.category as any,
        from: req.query.from ? parseInt(req.query.from as string) : 0,
        size: req.query.size ? parseInt(req.query.size as string) : 50
      };

      const result = await elasticsearchService.searchEmails(query);

      res.json({
        success: true,
        data: result.emails,
        total: result.total,
        from: query.from,
        size: query.size
      });
    } catch (error: any) {
      console.error('Error in searchEmails:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getEmailById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const email = await elasticsearchService.getEmailById(id);

      if (!email) {
        res.status(404).json({
          success: false,
          error: 'Email not found'
        });
        return;
      }

      res.json({
        success: true,
        data: email
      });
    } catch (error: any) {
      console.error('Error in getEmailById:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateEmailCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { category } = req.body;

      await elasticsearchService.updateEmail(id, { category });

      res.json({
        success: true,
        message: 'Email category updated successfully'
      });
    } catch (error: any) {
      console.error('Error in updateEmailCategory:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async generateReply(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const email = await elasticsearchService.getEmailById(id);

      if (!email) {
        res.status(404).json({
          success: false,
          error: 'Email not found'
        });
        return;
      }

      const suggestedReply = await ragService.generateSuggestedReply(
        email.subject,
        email.body
      );

      // Update email with suggested reply
      await elasticsearchService.updateEmail(id, { suggestedReply });

      res.json({
        success: true,
        data: {
          suggestedReply
        }
      });
    } catch (error: any) {
      console.error('Error in generateReply:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = imapService.getConnectionStatus();

      res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('Error in getConnectionStatus:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async addContext(req: Request, res: Response): Promise<void> {
    try {
      const { context, metadata } = req.body;

      if (!context) {
        res.status(400).json({
          success: false,
          error: 'Context is required'
        });
        return;
      }

      await ragService.addCustomContext(context, metadata || {});

      res.json({
        success: true,
        message: 'Context added successfully'
      });
    } catch (error: any) {
      console.error('Error in addContext:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const categories = ['Interested', 'Meeting Booked', 'Not Interested', 'Spam', 'Out of Office'];
      const stats: any = {
        total: 0,
        byCategory: {},
        byAccount: {}
      };

      // Get total count
      const allEmails = await elasticsearchService.searchEmails({ size: 0 });
      stats.total = allEmails.total;

      // Get counts by category
      for (const category of categories) {
        const result = await elasticsearchService.searchEmails({ category: category as any, size: 0 });
        stats.byCategory[category] = result.total;
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const emailController = new EmailController();

import { Client } from '@elastic/elasticsearch';
import { config } from '../config';
import { Email, SearchQuery } from '../models/email.model';

export class ElasticsearchService {
  private client: Client;
  private index: string;

  constructor() {
    this.client = new Client({ node: config.elasticsearch.url });
    this.index = config.elasticsearch.index;
  }

  async initialize(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.index });

      if (!exists) {
        await this.client.indices.create({
          index: this.index,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                accountId: { type: 'keyword' },
                folder: { type: 'keyword' },
                from: {
                  properties: {
                    name: { type: 'text' },
                    address: { type: 'keyword' }
                  }
                },
                to: {
                  properties: {
                    name: { type: 'text' },
                    address: { type: 'keyword' }
                  }
                },
                subject: { type: 'text' },
                body: { type: 'text' },
                html: { type: 'text', index: false },
                date: { type: 'date' },
                uid: { type: 'integer' },
                category: { type: 'keyword' },
                suggestedReply: { type: 'text' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' }
              }
            }
          }
        });
        console.log(`Elasticsearch index '${this.index}' created successfully`);
      } else {
        console.log(`Elasticsearch index '${this.index}' already exists`);
      }
    } catch (error) {
      console.error('Error initializing Elasticsearch:', error);
      throw error;
    }
  }

  async indexEmail(email: Email): Promise<void> {
    try {
      await this.client.index({
        index: this.index,
        id: email.id,
        body: email
      });
      console.log(`Email ${email.id} indexed successfully`);
    } catch (error) {
      console.error('Error indexing email:', error);
      throw error;
    }
  }

  async updateEmail(id: string, updates: Partial<Email>): Promise<void> {
    try {
      await this.client.update({
        index: this.index,
        id,
        body: {
          doc: {
            ...updates,
            updatedAt: new Date()
          }
        }
      });
      console.log(`Email ${id} updated successfully`);
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  async searchEmails(query: SearchQuery): Promise<{ emails: Email[]; total: number }> {
    try {
      const must: any[] = [];

      if (query.query) {
        must.push({
          multi_match: {
            query: query.query,
            fields: ['subject^2', 'body', 'from.name', 'from.address']
          }
        });
      }

      if (query.accountId) {
        must.push({ term: { accountId: query.accountId } });
      }

      if (query.folder) {
        must.push({ term: { folder: query.folder } });
      }

      if (query.category) {
        must.push({ term: { category: query.category } });
      }

      const result = await this.client.search({
        index: this.index,
        body: {
          query: must.length > 0 ? { bool: { must } } : { match_all: {} },
          from: query.from || 0,
          size: query.size || 50,
          sort: [{ date: { order: 'desc' } }]
        }
      });

      const emails = result.hits.hits.map((hit: any) => hit._source as Email);
      const total = typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value || 0;

      return { emails, total };
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  }

  async getEmailById(id: string): Promise<Email | null> {
    try {
      const result = await this.client.get({
        index: this.index,
        id
      });
      return result._source as Email;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      console.error('Error getting email by ID:', error);
      throw error;
    }
  }

  async emailExists(accountId: string, uid: number): Promise<boolean> {
    try {
      const result = await this.client.search({
        index: this.index,
        body: {
          query: {
            bool: {
              must: [
                { term: { accountId } },
                { term: { uid } }
              ]
            }
          },
          size: 1
        }
      });
      const total = typeof result.hits.total === 'number'
        ? result.hits.total
        : result.hits.total?.value || 0;
      return total !== 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }
}

export const elasticsearchService = new ElasticsearchService();

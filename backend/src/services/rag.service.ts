import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
}

export class RagService {
  private qdrant: QdrantClient;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private collectionName: string;

  constructor() {
    // Configure Qdrant client with API key for cloud deployments
    const qdrantConfig: any = { url: config.qdrant.url };
    if (config.qdrant.apiKey) {
      qdrantConfig.apiKey = config.qdrant.apiKey;
    }
    this.qdrant = new QdrantClient(qdrantConfig);
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    this.collectionName = config.qdrant.collection;
  }

  async initialize(): Promise<void> {
    try {
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        await this.qdrant.createCollection(this.collectionName, {
          vectors: {
            size: 768, // Gemini embedding dimension
            distance: 'Cosine'
          }
        });
        console.log(`Qdrant collection '${this.collectionName}' created successfully`);

        // Store the RAG context
        await this.storeContext(config.rag.context);
      } else {
        console.log(`Qdrant collection '${this.collectionName}' already exists`);
      }
    } catch (error) {
      console.error('Error initializing Qdrant:', error);
      throw error;
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }

  async storeContext(context: string): Promise<void> {
    try {
      const embedding = await this.getEmbedding(context);

      await this.qdrant.upsert(this.collectionName, {
        points: [
          {
            id: 'rag_context_1',
            vector: embedding,
            payload: {
              text: context,
              type: 'context'
            }
          }
        ]
      });

      console.log('RAG context stored successfully');
    } catch (error) {
      console.error('Error storing context:', error);
      throw error;
    }
  }

  async retrieveRelevantContext(query: string, topK: number = 3): Promise<string[]> {
    try {
      const queryEmbedding = await this.getEmbedding(query);

      const searchResult = await this.qdrant.search(this.collectionName, {
        vector: queryEmbedding,
        limit: topK
      });

      return searchResult.map(result => (result.payload as any).text);
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  async generateSuggestedReply(emailSubject: string, emailBody: string): Promise<string> {
    try {
      // Retrieve relevant context from vector database
      const contexts = await this.retrieveRelevantContext(emailBody);

      const prompt = `Based on the following context about my outreach agenda:
${contexts.join('\n')}

I received this email:
Subject: ${emailSubject}
Body: ${emailBody}

Generate a professional, concise reply that:
1. Acknowledges their message
2. Uses the context information appropriately
3. Maintains a friendly and professional tone
4. Is 2-3 sentences maximum

Reply:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating suggested reply:', error);
      return '';
    }
  }

  async addCustomContext(context: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const embedding = await this.getEmbedding(context);
      const id = `context_${Date.now()}`;

      await this.qdrant.upsert(this.collectionName, {
        points: [
          {
            id,
            vector: embedding,
            payload: {
              text: context,
              ...metadata
            }
          }
        ]
      });

      console.log('Custom context added successfully');
    } catch (error) {
      console.error('Error adding custom context:', error);
      throw error;
    }
  }
}

export const ragService = new RagService();

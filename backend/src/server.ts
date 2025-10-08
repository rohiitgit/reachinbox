import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from './config';
import emailRoutes from './routes/email.routes';
import { elasticsearchService } from './services/elasticsearch.service';
import { imapService } from './services/imap.service';
import { ragService } from './services/rag.service';

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
  }

  private configureMiddleware(): void {
    // Configure CORS for production
    const corsOptions = {
      origin: config.nodeEnv === 'production'
        ? [
            'https://reachinbox-frontend.vercel.app',
            /\.vercel\.app$/  // Allow all Vercel preview deployments
          ]
        : '*',
      credentials: true
    };
    this.app.use(cors(corsOptions));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Reachinbox Email Onebox API is running',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/emails', emailRoutes);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    });
  }

  private async initializeServices(): Promise<void> {
    console.log('Initializing services...');

    try {
      // Initialize Elasticsearch
      console.log('Initializing Elasticsearch...');
      await elasticsearchService.initialize();

      // Initialize Qdrant and RAG service
      console.log('Initializing RAG service...');
      await ragService.initialize();

      // Initialize IMAP connections
      console.log('Initializing IMAP service...');
      await imapService.initialize();

      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Error initializing services:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      // Initialize services
      await this.initializeServices();

      // Start server
      this.app.listen(config.port, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   Reachinbox Email Onebox API                           ║
║                                                          ║
║   Server running on: http://localhost:${config.port}           ║
║   Environment: ${config.nodeEnv}                        ║
║                                                          ║
║   Services:                                              ║
║   ✓ Elasticsearch (${config.elasticsearch.url})
║   ✓ Qdrant Vector DB (${config.qdrant.url})
║   ✓ IMAP Real-time Sync (IDLE mode)                     ║
║   ✓ AI Categorization                                   ║
║   ✓ RAG-powered Reply Suggestions                       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
        `);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    console.log('\nShutting down gracefully...');
    await imapService.disconnect();
    process.exit(0);
  }
}

// Start server
const server = new Server();
server.start();

import { TwitterStream } from '../twitter/stream';
import { DEXScreenerAPI } from '../chain/dex-screener';
import { ReplyEngine } from '../automation/reply-engine';
import { TradingExecutor } from '../trading/executor';
import { RateLimiter } from '../utils/rate-limiter';
import { Logger } from '../utils/logger';

const logger = Logger.getInstance();

class XKOLAutomation {
  private app: express.Application;
  private twitterStream?: TwitterStream;
  private dexScreener?: DEXScreenerAPI;
  private replyEngine?: ReplyEngine;
  private tradingExecutor?: TradingExecutor;
  private isRunning: boolean = false;
  private dataCollectionInterval?: NodeJS.Timeout;
  private signalGenerationInterval?: NodeJS.Timeout;
  private rateLimiter: RateLimiter;
  private startTime: Date;

  constructor() {
    this.app = express();
    this.rateLimiter = new RateLimiter({ maxCalls: 50, timeWindowMs: 900000 });
    this.startTime = new Date();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  async initialize() {
    logger.info('Initializing X KOL Automation System...');

    try {
      await initializeDatabase();
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', 'db', error);
      throw error;
    }

    this.twitterStream = new TwitterStream({
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || ''
    });

    this.dexScreener = new DEXScreenerAPI();

    if (process.env.OPENAI_API_KEY) {
      this.replyEngine = new ReplyEngine(process.env.OPENAI_API_KEY, this.twitterStream);
    } else {
      logger.warn('OPENAI_API_KEY not set - content generation disabled');
    }

    if (process.env.SOLANA_RPC_URL && process.env.PRIVATE_KEY) {
      this.tradingExecutor = new TradingExecutor(
        process.env.SOLANA_RPC_URL,
        process.env.PRIVATE_KEY
      );
    } else {
      logger.info('SOLANA_RPC_URL or PRIVATE_KEY not set - trading disabled');
    }

    logger.info('System initialization completed');
  }

  async start() {
    if (this.isRunning) {
      logger.warn('System already running');
      return;
    }

    logger.info('Starting X KOL Automation System...');
    this.isRunning = true;

    if (this.twitterStream && this.replyEngine) {
      const influencers = [
        'elonmusk', 'cz_binance', 'vitalikbuterin', 'APompliano',
        'scottmelker', 'CryptoCobain', 'HsakaTrades', 'loomdart'
      ];
      const keywords = [
        '#crypto', '#bitcoin', '#ethereum', '#solana', '#meme', 'degen',
        'altcoin', 'defi', 'nft', 'web3'
      ];

      this.twitterStream.startTracking(influencers, keywords, this.handleTweet.bind(this));
      logger.info(`Twitter stream started - tracking ${influencers.length} influencers and ${keywords.length} keywords`);
    }

    this.startDataCollection();
    this.startSignalGeneration();
    this.startHealthCheck();
  }

  async stop() {
    logger.info('Stopping X KOL Automation System...');
    this.isRunning = false;

    if (this.dataCollectionInterval) {
      clearInterval(this.dataCollectionInterval);
    }
    if (this.signalGenerationInterval) {
      clearInterval(this.signalGenerationInterval);
    }

    if (this.twitterStream) {
      this.twitterStream.stop();
    }

    logger.info('System stopped');
  }

  private async handleTweet(tweet: any): Promise<void> {
    try {
      if (!this.replyEngine) return;

      logger.info(`Processing tweet from @${tweet.user.screen_name}: ${tweet.text.substring(0, 80)}...`);
      
      const replies = await this.replyEngine.processTweet(tweet, 1, undefined, true);
      logger.info(`Generated ${replies.length} engagement actions for tweet ${tweet.id_str}`);

      if (this.dexScreener) {
        try {
          const trending = await this.dexScreener.getTrendingTokens();
          if (trending.length > 0) {
            logger.debug(`Found ${trending.length} trending tokens`, 'dex', { 
              topToken: trending[0]?.symbol,
              topPrice: trending[0]?.price 
            });
          }
        } catch (error) {
          logger.error('Error fetching trending tokens:', 'dex', error);
        }
      }
    } catch (error) {
      logger.error('Error handling tweet:', 'twitter', error);
    }
  }

  private startDataCollection(): void {
    this.dataCollectionInterval = setInterval(async () => {
      try {
        if (this.dexScreener) {
          const trending = await this.dexScreener.getTrendingTokens();
          logger.info(`Data collection cycle: ${trending.length} trending tokens`, 'dex');
        }
      } catch (error) {
        logger.error('Data collection error:', 'dex', error);
      }
    }, 5 * 60 * 1000);
  }

  private startSignalGeneration(): void {
    this.signalGenerationInterval = setInterval(async () => {
      try {
        if (this.tradingExecutor && this.dexScreener) {
          const gainers = await this.dexScreener.getTopGainers();
          const volumeSpikes = await this.dexScreener.getVolumeSpikes();
          
          logger.info(`Signal generation: ${gainers.length} gainers, ${volumeSpikes.length} volume spikes`, 'trading');
          
          if (gainers.length > 0) {
            logger.debug('Top gainers:', 'trading', gainers.slice(0, 3).map(t => ({
              symbol: t.symbol,
              price: t.price,
              change: t.change_24h
            })));
          }
        }
      } catch (error) {
        logger.error('Signal generation error:', 'trading', error);
      }
    }, 15 * 60 * 1000);
  }

  private startHealthCheck(): void {
    setInterval(() => {
      try {
        const stats = logger.getStats();
        const health = this.getHealthStatus();
        
        if (stats.error > 0) {
          logger.warn(`Health check: ${stats.error} errors in last cycle`, 'health');
        }
        
        logger.debug('Health check completed', 'health', health);
      } catch (error) {
        logger.error('Health check failed:', 'health', error);
      }
    }, 5 * 60 * 1000);
  }

  getHealthStatus(): any {
    return {
      isRunning: this.isRunning,
      uptime: process.uptime(),
      startTime: this.startTime.toISOString(),
      processedTweets: this.replyEngine?.getProcessedCount() || 0,
      activeTrades: this.tradingExecutor?.getAllActiveTrades().length || 0,
      rateLimiter: this.rateLimiter.getRemainingCalls(),
      logs: logger.getStats()
    };
  }

  private initializeMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.path}`, 'http');
      next();
    });
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json(this.getHealthStatus());
    });

    this.app.get('/status', (req, res) => {
      res.json({
        system: 'X KOL Automation',
        version: '1.0.0',
        status: this.isRunning ? 'running' : 'stopped',
        startTime: this.startTime.toISOString(),
        uptime: process.uptime(),
        components: {
          twitter: !!this.twitterStream,
          dexScreener: !!this.dexScreener,
          replyEngine: !!this.replyEngine,
          tradingExecutor: !!this.tradingExecutor
        },
        config: {
          port: process.env.PORT,
          nodeEnv: process.env.NODE_ENV
        }
      });
    });

    this.app.get('/logs', (req, res) => {
      const level = req.query.level as any;
      const logs = logger.getLogs(level, 100);
      res.json({ logs, stats: logger.getStats() });
    });

    this.app.post('/start', async (req, res) => {
      try {
        await this.start();
        res.json({ success: true, message: 'System started' });
      } catch (error) {
        logger.error('Failed to start system:', 'api', error);
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.post('/stop', async (req, res) => {
      try {
        await this.stop();
        res.json({ success: true, message: 'System stopped' });
      } catch (error) {
        logger.error('Failed to stop system:', 'api', error);
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/rate-limit', (req, res) => {
      res.json({
        remaining: this.rateLimiter.getRemainingCalls(),
        nextAvailable: this.rateLimiter.getNextAvailable()
      });
    });

    this.app.get('/engagement', (req, res) => {
      if (this.replyEngine) {
        const history = this.replyEngine.getEngagementHistory();
        const recent = Array.from(history.entries())
          .filter(([_, time]) => Date.now() - time.getTime() < 24 * 60 * 60 * 1000);
        res.json({ 
          totalProcessed: this.replyEngine.getProcessedCount(),
          recentEngagements: recent.length,
          history: Array.from(history.entries()).slice(-50)
        });
      } else {
        res.json({ error: 'Reply engine not initialized' });
      }
    });

    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error(`Request error ${req.method} ${req.path}:`, 'api', err);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}

export { XKOLAutomation };
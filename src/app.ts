import express from 'express';
import { db } from './db';
import { initializeDatabase } from './db/schema';
import { TwitterStream } from '../twitter/stream';
import { DEXScreenerAPI } from '../chain/dex-screener';
import { ReplyEngine } from '../automation/reply-engine';
import { TradingExecutor } from '../trading/executor';

class XKOLAutomation {
  private app: express.Application;
  private twitterStream?: TwitterStream;
  private dexScreener?: DEXScreenerAPI;
  private replyEngine?: ReplyEngine;
  private tradingExecutor?: TradingExecutor;
  private isRunning: boolean = false;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  async initialize() {
    console.log('Initializing X KOL Automation System...');

    try {
      await initializeDatabase();
      console.log('Database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
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
      this.replyEngine = new ReplyEngine(process.env.OPENAI_API_KEY);
    }

    if (process.env.SOLANA_RPC_URL && process.env.PRIVATE_KEY) {
      this.tradingExecutor = new TradingExecutor(
        process.env.SOLANA_RPC_URL,
        process.env.PRIVATE_KEY
      );
    }

    console.log('System initialized successfully');
  }

  async start() {
    if (this.isRunning) {
      console.log('System already running');
      return;
    }

    console.log('Starting X KOL Automation System...');
    this.isRunning = true;

    if (this.twitterStream) {
      const influencers = [
        'elonmusk', 'cz_binance', 'vitalikbuterin', 'APompliano',
        'scottmelker', 'CryptoCobain', 'HsakaTrades', 'loomdart'
      ];
      const keywords = ['#crypto', '#bitcoin', '#ethereum', '#solana', '#meme', 'degen'];

      this.twitterStream.startTracking(influencers, keywords, this.handleTweet.bind(this));
      console.log('Twitter stream started');
    }

    this.startDataCollection();
    this.startSignalGeneration();
  }

  async stop() {
    console.log('Stopping X KOL Automation System...');
    this.isRunning = false;

    if (this.twitterStream) {
      this.twitterStream.stop();
    }

    console.log('System stopped');
  }

  private async handleTweet(tweet: any): Promise<void> {
    try {
      console.log(`Processing tweet from @${tweet.user.screen_name}: ${tweet.text.substring(0, 100)}...`);

      if (this.replyEngine) {
        const replies = await this.replyEngine.processTweet(tweet, 1);
        console.log(`Generated ${replies.length} replies`);
      }

      if (this.dexScreener) {
        const trending = await this.dexScreener.getTrendingTokens();
        console.log(`Found ${trending.length} trending tokens`);
      }
    } catch (error) {
      console.error('Error handling tweet:', error);
    }
  }

  private async startDataCollection(): Promise<void> {
    setInterval(async () => {
      try {
        if (this.dexScreener) {
          const trending = await this.dexScreener.getTrendingTokens();
          console.log(`Data collection: ${trending.length} trending tokens`);
        }
      } catch (error) {
        console.error('Data collection error:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async startSignalGeneration(): Promise<void> {
    setInterval(async () => {
      try {
        if (this.tradingExecutor && this.dexScreener) {
          const trending = await this.dexScreener.getTopGainers();
          console.log(`Signal generation: analyzing ${trending.length} top gainers`);
        }
      } catch (error) {
        console.error('Signal generation error:', error);
      }
    }, 15 * 60 * 1000);
  }

  getHealthStatus(): any {
    return {
      isRunning: this.isRunning,
      processedTweets: this.replyEngine?.getProcessedCount() || 0,
      activeTrades: this.tradingExecutor?.getAllActiveTrades().length || 0,
      uptime: process.uptime()
    };
  }

  private initializeMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
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
        components: {
          twitter: !!this.twitterStream,
          dexScreener: !!this.dexScreener,
          replyEngine: !!this.replyEngine,
          tradingExecutor: !!this.tradingExecutor
        }
      });
    });

    this.app.post('/start', async (req, res) => {
      try {
        await this.start();
        res.json({ success: true, message: 'System started' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/stop', async (req, res) => {
      try {
        await this.stop();
        res.json({ success: true, message: 'System stopped' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}

export { XKOLAutomation };
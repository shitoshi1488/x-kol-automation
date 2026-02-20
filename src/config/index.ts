import dotenv from 'dotenv';
dotenv.config();

export interface Config {
  twitter: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
  openai: {
    apiKey: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  solana: {
    rpcUrl: string;
    privateKey?: string;
  };
  server: {
    port: number;
  };
}

export function validateConfig(): Config {
  const required = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_TOKEN_SECRET',
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'REDIS_URL',
    'SOLANA_RPC_URL'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    twitter: {
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!
    },
    database: {
      url: process.env.DATABASE_URL!
    },
    redis: {
      url: process.env.REDIS_URL!
    },
    solana: {
      rpcUrl: process.env.SOLANA_RPC_URL!,
      privateKey: process.env.PRIVATE_KEY
    },
    server: {
      port: parseInt(process.env.PORT || '3000', 10)
    }
  };
}
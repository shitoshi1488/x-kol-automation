export interface TwitterAccount {
  id?: number;
  username: string;
  persona_id?: number;
  api_key: string;
  api_secret: string;
  access_token: string;
  access_token_secret: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Persona {
  id?: number;
  name: string;
  bio?: string;
  expertise: string[];
  tone: 'technical' | 'casual' | 'meme';
  engagement_style: 'helpful' | 'controversial' | 'neutral';
  created_at?: Date;
  updated_at?: Date;
}

export interface Tweet {
  id?: number;
  tweet_id: string;
  author_username: string;
  content: string;
  author_followers: number;
  author_verified: boolean;
  engagement_score?: number;
  processed: boolean;
  created_at?: Date;
}

export interface Reply {
  id?: number;
  tweet_id: string;
  twitter_account_id: number;
  content: string;
  persona_id: number;
  engagement_type: 'reply' | 'like' | 'retweet';
  created_at?: Date;
}

export interface OnchainData {
  id?: number;
  token_address: string;
  token_name?: string;
  token_symbol?: string;
  price: number;
  volume_24h: number;
  market_cap: number;
  trending_score?: number;
  source: string;
  data?: any;
  created_at?: Date;
}

export interface Signal {
  id?: number;
  token_address: string;
  signal_type: 'buy' | 'sell' | 'hold';
  confidence_score: number;
  price_target?: number;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  twitter_account_id: number;
  processed: boolean;
  created_at?: Date;
}

export interface TwitterStreamEvent {
  tweet_id: string;
  text: string;
  user: {
    id: string;
    screen_name: string;
    followers_count: number;
    verified: boolean;
  };
  created_at: string;
  entities?: any;
  retweet_count?: number;
  favorite_count?: number;
}

export interface DEXScreenerToken {
  address: string;
  name: string;
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  liquidity: number;
  holders: number;
  transactions_24h: number;
  trending_score?: number;
}

export interface TradingSignal {
  token_address: string;
  signal_type: 'buy' | 'sell' | 'hold';
  confidence: number;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  source: string;
  timestamp: Date;
}

export interface TradingExecution {
  token_address: string;
  amount: number;
  side: 'buy' | 'sell';
  slippage: number;
  deadline: Date;
  transaction_hash?: string;
  status: 'pending' | 'executed' | 'failed';
  created_at?: Date;
  updated_at?: Date;
}
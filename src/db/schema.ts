export const createTables = `
  CREATE TABLE IF NOT EXISTS twitter_accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    persona_id INT REFERENCES personas(id),
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    access_token VARCHAR(255),
    access_token_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS personas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    expertise TEXT[],
    tone VARCHAR(50),
    engagement_style VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS tweets (
    id SERIAL PRIMARY KEY,
    tweet_id VARCHAR(255) UNIQUE NOT NULL,
    author_username VARCHAR(255),
    content TEXT,
    author_followers INT,
    author_verified BOOLEAN,
    engagement_score DECIMAL(10,2),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS replies (
    id SERIAL PRIMARY KEY,
    tweet_id VARCHAR(255) REFERENCES tweets(tweet_id),
    twitter_account_id INT REFERENCES twitter_accounts(id),
    content TEXT,
    persona_id INT REFERENCES personas(id),
    engagement_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS onchain_data (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(255),
    token_name VARCHAR(255),
    token_symbol VARCHAR(50),
    price DECIMAL(20,10),
    volume_24h DECIMAL(20,2),
    market_cap DECIMAL(20,2),
    trending_score DECIMAL(5,2),
    source VARCHAR(50),
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(255),
    signal_type VARCHAR(50),
    confidence_score DECIMAL(5,2),
    price_target DECIMAL(20,10),
    entry_price DECIMAL(20,10),
    stop_loss DECIMAL(20,10),
    take_profit DECIMAL(20,10),
    twitter_account_id INT REFERENCES twitter_accounts(id),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

export const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_tweets_author_username ON tweets(author_username);
  CREATE INDEX IF NOT EXISTS idx_tweets_processed ON tweets(processed);
  CREATE INDEX IF NOT EXISTS idx_replies_tweet_id ON replies(tweet_id);
  CREATE INDEX IF NOT EXISTS idx_onchain_token_address ON onchain_data(token_address);
  CREATE INDEX IF NOT EXISTS idx_signals_processed ON signals(processed);
  CREATE INDEX IF NOT EXISTS idx_signals_token_address ON signals(token_address);
`;

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    await db.query(createTables);
    await db.query(createIndexes);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
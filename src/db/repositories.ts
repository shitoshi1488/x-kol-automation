import { db, createTables, initializeDatabase } from './db';
import { Persona, TwitterAccount, Tweet, Reply, OnchainData, Signal } from '../types';

export class TwitterAccountRepository {
  async create(account: TwitterAccount): Promise<TwitterAccount> {
    const result = await db.query(
      'INSERT INTO twitter_accounts (username, persona_id, api_key, api_secret, access_token, access_token_secret) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [account.username, account.persona_id, account.api_key, account.api_secret, account.access_token, account.access_token_secret]
    );
    return result.rows[0];
  }

  async findByUsername(username: string): Promise<TwitterAccount | null> {
    const result = await db.query('SELECT * FROM twitter_accounts WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  async update(account: TwitterAccount): Promise<TwitterAccount> {
    const result = await db.query(
      `UPDATE twitter_accounts 
       SET username = $1, persona_id = $2, api_key = $3, api_secret = $4, access_token = $5, access_token_secret = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [account.username, account.persona_id, account.api_key, account.api_secret, account.access_token, account.access_token_secret, account.id]
    );
    return result.rows[0];
  }

  async findAll(): Promise<TwitterAccount[]> {
    const result = await db.query('SELECT * FROM twitter_accounts ORDER BY created_at DESC');
    return result.rows;
  }
}

export class PersonaRepository {
  async create(persona: Persona): Promise<Persona> {
    const result = await db.query(
      'INSERT INTO personas (name, bio, expertise, tone, engagement_style) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [persona.name, persona.bio, persona.expertise, persona.tone, persona.engagement_style]
    );
    return result.rows[0];
  }

  async findByName(name: string): Promise<Persona | null> {
    const result = await db.query('SELECT * FROM personas WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Persona[]> {
    const result = await db.query('SELECT * FROM personas ORDER BY created_at DESC');
    return result.rows;
  }
}

export class TweetRepository {
  async create(tweet: Tweet): Promise<Tweet> {
    const result = await db.query(
      'INSERT INTO tweets (tweet_id, author_username, content, author_followers, author_verified, engagement_score) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [tweet.tweet_id, tweet.author_username, tweet.content, tweet.author_followers, tweet.author_verified, tweet.engagement_score]
    );
    return result.rows[0];
  }

  async findByTweetId(tweetId: string): Promise<Tweet | null> {
    const result = await db.query('SELECT * FROM tweets WHERE tweet_id = $1', [tweetId]);
    return result.rows[0] || null;
  }

  async markProcessed(tweetId: string): Promise<void> {
    await db.query('UPDATE tweets SET processed = TRUE WHERE tweet_id = $1', [tweetId]);
  }

  async findUnprocessed(): Promise<Tweet[]> {
    const result = await db.query('SELECT * FROM tweets WHERE processed = FALSE ORDER BY created_at ASC LIMIT 10');
    return result.rows;
  }
}

export class ReplyRepository {
  async create(reply: Reply): Promise<Reply> {
    const result = await db.query(
      'INSERT INTO replies (tweet_id, twitter_account_id, content, persona_id, engagement_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [reply.tweet_id, reply.twitter_account_id, reply.content, reply.persona_id, reply.engagement_type]
    );
    return result.rows[0];
  }

  async findByTweetId(tweetId: string): Promise<Reply[]> {
    const result = await db.query('SELECT * FROM replies WHERE tweet_id = $1 ORDER BY created_at DESC', [tweetId]);
    return result.rows;
  }
}

export class OnchainDataRepository {
  async create(data: OnchainData): Promise<OnchainData> {
    const result = await db.query(
      `INSERT INTO onchain_data 
       (token_address, token_name, token_symbol, price, volume_24h, market_cap, trending_score, source, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.token_address, data.token_name, data.token_symbol, data.price, data.volume_24h, data.market_cap, data.trending_score, data.source, data.data]
    );
    return result.rows[0];
  }

  async findByTokenAddress(tokenAddress: string): Promise<OnchainData | null> {
    const result = await db.query('SELECT * FROM onchain_data WHERE token_address = $1 ORDER BY created_at DESC LIMIT 1', [tokenAddress]);
    return result.rows[0] || null;
  }

  async findTrending(): Promise<OnchainData[]> {
    const result = await db.query('SELECT * FROM onchain_data WHERE trending_score > 7 ORDER BY trending_score DESC LIMIT 10');
    return result.rows;
  }
}

export class SignalRepository {
  async create(signal: Signal): Promise<Signal> {
    const result = await db.query(
      `INSERT INTO signals 
       (token_address, signal_type, confidence_score, price_target, entry_price, stop_loss, take_profit, twitter_account_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [signal.token_address, signal.signal_type, signal.confidence_score, signal.price_target, signal.entry_price, signal.stop_loss, signal.take_profit, signal.twitter_account_id]
    );
    return result.rows[0];
  }

  async findUnprocessed(): Promise<Signal[]> {
    const result = await db.query('SELECT * FROM signals WHERE processed = FALSE ORDER BY created_at ASC LIMIT 10');
    return result.rows;
  }

  async markProcessed(signalId: number): Promise<void> {
    await db.query('UPDATE signals SET processed = TRUE WHERE id = $1', [signalId]);
  }
}
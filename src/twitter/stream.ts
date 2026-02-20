import { Twit } from 'twit';
import { TwitterStreamEvent } from '../types';

export class TwitterStream {
  private client: Twit;
  private stream: any;

  constructor(config: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }) {
    this.client = new Twit({
      consumer_key: config.apiKey,
      consumer_secret: config.apiSecret,
      access_token: config.accessToken,
      access_token_secret: config.accessTokenSecret,
    });
  }

  startTracking(influencers: string[], keywords: string[], onTweet: (tweet: TwitterStreamEvent) => void) {
    this.stream = this.client.stream('statuses/filter', {
      follow: influencers,
      track: keywords,
    });

    this.stream.on('tweet', (tweet: any) => {
      const twitterEvent: TwitterStreamEvent = {
        tweet_id: tweet.id_str,
        text: tweet.text,
        user: {
          id: tweet.user.id_str,
          screen_name: tweet.user.screen_name,
          followers_count: tweet.user.followers_count,
          verified: tweet.user.verified,
        },
        created_at: tweet.created_at,
        entities: tweet.entities,
        retweet_count: tweet.retweet_count,
        favorite_count: tweet.favorite_count,
      };
      onTweet(twitterEvent);
    });

    this.stream.on('error', (error: any) => {
      console.error('Twitter stream error:', error);
      // Reconnect logic could be added here
    });

    console.log('Twitter stream started tracking:', { influencers, keywords });
  }

  stop() {
    if (this.stream) {
      this.stream.stop();
      console.log('Twitter stream stopped');
    }
  }

  async getUserTimeline(username: string, count = 20): Promise<any[]> {
    const result = await this.client.get('statuses/user_timeline', {
      screen_name: username,
      count,
      tweet_mode: 'extended',
      exclude_replies: true,
    });
    return result.data;
  }

  async getUserInfo(username: string): Promise<any> {
    const result = await this.client.get('users/show', {
      screen_name: username,
    });
    return result.data;
  }

  async postReply(tweetId: string, text: string): Promise<any> {
    try {
      const result = await this.client.post('statuses/update', {
        status: text,
        in_reply_to_status_id: tweetId,
        auto_populate_reply_metadata: true,
      });
      return result.data;
    } catch (error) {
      console.error(`Error posting reply to tweet ${tweetId}:`, error);
      throw error;
    }
  }

  async retweet(tweetId: string): Promise<any> {
    try {
      const result = await this.client.post('statuses/retweet/:id', { id: tweetId });
      return result.data;
    } catch (error) {
      console.error(`Error retweeting ${tweetId}:`, error);
      throw error;
    }
  }

  async like(tweetId: string): Promise<any> {
    try {
      const result = await this.client.post('favorites/create', { id: tweetId });
      return result.data;
    } catch (error) {
      console.error(`Error liking tweet ${tweetId}:`, error);
      throw error;
    }
  }

  async unlike(tweetId: string): Promise<any> {
    try {
      const result = await this.client.post('favorites/destroy', { id: tweetId });
      return result.data;
    } catch (error) {
      console.error(`Error unliking tweet ${tweetId}:`, error);
      throw error;
    }
  }

  async getUserRateLimitStatus(): Promise<any> {
    try {
      const result = await this.client.get('application/rate_limit_status', {
        resources: 'statuses,users,favorites'
      });
      return result.data;
    } catch (error) {
      console.error('Error checking rate limits:', error);
      return null;
    }
  }
}
import { TwitterStream } from '../twitter/stream';
import { PersonaManager } from '../personas/manager';
import { ContentGenerator } from './generator';
import { Tweet, Reply } from '../types';

export class ReplyEngine {
  private personaManager: PersonaManager;
  private contentGenerator: ContentGenerator;
  private twitterClient?: TwitterStream;
  private processedTweets: Set<string> = new Set();
  private engagementHistory: Map<string, Date> = new Map();

  constructor(openaiApiKey: string, twitterClient?: TwitterStream) {
    this.personaManager = new PersonaManager();
    this.contentGenerator = new ContentGenerator(openaiApiKey);
    this.twitterClient = twitterClient;
  }

  async processTweet(tweet: Tweet, accountId: number, personaName?: string, shouldPost: boolean = true): Promise<Reply[]> {
    try {
      if (this.processedTweets.has(tweet.tweet_id)) {
        return [];
      }
      this.processedTweets.add(tweet.tweet_id);

      const persona = personaName 
        ? this.personaManager.getPersona(personaName)
        : this.personaManager.selectBestPersonaForTweet(tweet.content);

      if (!persona) {
        console.warn(`No persona found for tweet ${tweet.tweet_id}`);
        return [];
      }

      const replies: Reply[] = [];
      const now = new Date();

      if (this.shouldEngage(tweet)) {
        const replyContent = await this.contentGenerator.generateReply(tweet, persona);
        const replyRecord: Reply = {
          tweet_id: tweet.tweet_id,
          twitter_account_id: accountId,
          content: replyContent,
          persona_id: 1,
          engagement_type: 'reply'
        };
        replies.push(replyRecord);

        if (shouldPost && this.twitterClient) {
          try {
            await this.twitterClient.postReply(tweet.tweet_id, replyContent);
            console.log(`✓ Posted reply to @${tweet.author_username}: ${replyContent.substring(0, 50)}...`);
          } catch (error) {
            console.error('Failed to post reply:', error);
          }
        }

        if (this.shouldLike(tweet)) {
          if (shouldPost && this.twitterClient) {
            try {
              await this.twitterClient.like(tweet.tweet_id);
              console.log(`✓ Liked tweet from @${tweet.author_username}`);
            } catch (error) {
              console.error('Failed to like tweet:', error);
            }
          }
        }

        if (this.shouldRetweet(tweet)) {
          if (shouldPost && this.twitterClient) {
            try {
              await this.twitterClient.retweet(tweet.tweet_id);
              console.log(`✓ Retweeted @${tweet.author_username}`);
            } catch (error) {
              console.error('Failed to retweet:', error);
            }
          }
        }

        if (this.shouldCreateThread(tweet)) {
          try {
            const threadContent = await this.contentGenerator.generateThread(tweet, persona, 3);
            threadContent.forEach(async (content, index) => {
              const threadReply: Reply = {
                tweet_id: tweet.tweet_id,
                twitter_account_id: accountId,
                content: `[Thread ${index + 1}/3] ${content}`,
                persona_id: 1,
                engagement_type: 'reply'
              };
              replies.push(threadReply);

              if (shouldPost && this.twitterClient && index < 2) {
                try {
                  await this.twitterClient.postReply(tweet.tweet_id, threadReply.content);
                  console.log(`✓ Posted thread part ${index + 1}/3`);
                } catch (error) {
                  console.error(`Failed to post thread part ${index + 1}:`, error);
                }
              }
            });
          } catch (error) {
            console.error('Error generating thread:', error);
          }
        }

        this.engagementHistory.set(tweet.tweet_id, now);
      }

      return replies;
    } catch (error) {
      console.error(`Error processing tweet ${tweet.tweet_id}:`, error);
      return [];
    }
  }

  private shouldEngage(tweet: Tweet): boolean {
    const score = this.calculateEngagementScore(tweet);
    return score > 50;
  }

  private shouldLike(tweet: Tweet): boolean {
    const baseLikeRate = 0.3;
    const engagementMultiplier = (tweet.engagement_score || 50) / 100;
    const followerMultiplier = Math.min(tweet.author_followers / 10000, 2);
    
    return Math.random() < (baseLikeRate * engagementMultiplier * followerMultiplier);
  }

  private shouldRetweet(tweet: Tweet): boolean {
    const baseRetweetRate = 0.1;
    const authorityMultiplier = tweet.author_verified ? 2 : 1;
    const followerMultiplier = Math.min(tweet.author_followers / 10000, 1.5);
    
    return Math.random() < (baseRetweetRate * authorityMultiplier * followerMultiplier);
  }

  private shouldCreateThread(tweet: Tweet): boolean {
    const followerThreshold = 5000;
    const engagementThreshold = 50;
    const lengthThreshold = 80;

    return (
      tweet.author_followers > followerThreshold ||
      (tweet.engagement_score && tweet.engagement_score > engagementThreshold) ||
      tweet.content.length > lengthThreshold
    );
  }

  private calculateEngagementScore(tweet: Tweet): number {
    let score = 50;

    if (tweet.author_verified) score += 20;
    if (tweet.author_followers > 10000) score += 15;
    if (tweet.retweet_count > 10) score += 10;
    if (tweet.favorite_count > 50) score += 10;
    if (tweet.content.includes('?')) score += 5;

    const recency = this.timeSince(new Date(tweet.created_at)) / (1000 * 60 * 60);
    if (recency < 6) score += 10;
    else if (recency > 24) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private timeSince(date: Date): number {
    return Date.now() - date.getTime();
  }

  getProcessedCount(): number {
    return this.processedTweets.size;
  }

  getEngagementHistory(): Map<string, Date> {
    return new Map(this.engagementHistory);
  }

  clearProcessed(): void {
    this.processedTweets.clear();
    this.engagementHistory.clear();
  }

  setTwitterClient(client: TwitterStream): void {
    this.twitterClient = client;
  }
}
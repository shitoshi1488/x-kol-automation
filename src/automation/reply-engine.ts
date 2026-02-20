import { PersonaManager } from '../personas/manager';
import { ContentGenerator } from './generator';
import { Tweet, Reply } from '../types';

export class ReplyEngine {
  private personaManager: PersonaManager;
  private contentGenerator: ContentGenerator;
  private processedTweets: Set<string> = new Set();

  constructor(openaiApiKey: string) {
    this.personaManager = new PersonaManager();
    this.contentGenerator = new ContentGenerator(openaiApiKey);
  }

  async processTweet(tweet: Tweet, accountId: number, personaName?: string): Promise<Reply[]> {
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

      const replyContent = await this.contentGenerator.generateReply(tweet, persona);
      replies.push({
        tweet_id: tweet.tweet_id,
        twitter_account_id: accountId,
        content: replyContent,
        persona_id: 1,
        engagement_type: 'reply'
      });

      if (this.shouldCreateThread(tweet)) {
        const threadContent = await this.contentGenerator.generateThread(tweet, persona, 3);
        threadContent.forEach((content, index) => {
          replies.push({
            tweet_id: tweet.tweet_id,
            twitter_account_id: accountId,
            content: `[Thread ${index + 1}/3] ${content}`,
            persona_id: 1,
            engagement_type: 'reply'
          });
        });
      }

      return replies;
    } catch (error) {
      console.error(`Error processing tweet ${tweet.tweet_id}:`, error);
      return [];
    }
  }

  private shouldCreateThread(tweet: Tweet): boolean {
    const followerThreshold = 10000;
    const engagementThreshold = 100;

    return (
      tweet.author_followers > followerThreshold ||
      (tweet.engagement_score && tweet.engagement_score > engagementThreshold) ||
      tweet.content.length > 100
    );
  }

  getProcessedCount(): number {
    return this.processedTweets.size;
  }

  clearProcessed(): void {
    this.processedTweets.clear();
  }
}
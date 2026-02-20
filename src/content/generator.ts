import { OpenAIApi, Configuration } from 'openai';
import { Persona, Tweet } from '../types';

export class ContentGenerator {
  private openai: any;

  constructor(apiKey: string) {
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  async generateReply(tweet: Tweet, persona: Persona): Promise<string> {
    try {
      const prompt = this.buildReplyPrompt(tweet, persona);
      
      const response = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.buildSystemMessage(persona)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.getTemperatureForPersona(persona),
        max_tokens: 500
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating reply:', error);
      return this.fallbackReply(tweet, persona);
    }
  }

  async generateThread(parentTweet: Tweet, persona: Persona, threadLength = 3): Promise<string[]> {
    try {
      const prompt = this.buildThreadPrompt(parentTweet, persona, threadLength);
      
      const response = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.buildSystemMessage(persona)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.getTemperatureForPersona(persona),
        max_tokens: 1500
      });

      const content = response.data.choices[0].message.content;
      return content.split('\n\n').filter(line => line.trim().length > 0);
    } catch (error) {
      console.error('Error generating thread:', error);
      return this.fallbackThread(parentTweet, persona, threadLength);
    }
  }

  private buildSystemMessage(persona: Persona): string {
    const toneDescriptions: Record<string, string> = {
      technical: 'You are analytical and data-driven. Use precise language and include relevant metrics.',
      casual: 'You are relaxed and conversational. Use informal language and emojis occasionally.',
      meme: 'You are humorous and use internet culture references. Keep it light and entertaining.'
    };

    const engagementDescriptions: Record<string, string> = {
      helpful: 'Provide valuable insights and constructive contributions.',
      controversial: 'Take strong positions and spark debate.',
      neutral: 'Present balanced perspectives without taking sides.'
    };

    return `You are ${persona.name}, a ${persona.bio}. 
    Your expertise includes: ${persona.expertise.join(', ')}.
    Tone: ${toneDescriptions[persona.tone]}.
    Engagement style: ${engagementDescriptions[persona.engagement_style]}`;
  }

  private buildReplyPrompt(tweet: Tweet, persona: Persona): string {
    return `Respond to this tweet as ${persona.name}:

Tweet: "${tweet.content}"
Author: @${tweet.author_username}

Write a ${persona.tone} response that matches your persona. Keep it under 240 characters.`;
  }

  private buildThreadPrompt(parentTweet: Tweet, persona: Persona, threadLength: number): string {
    return `Create a ${threadLength}-tweet thread expanding on this tweet as ${persona.name}:

Original tweet: "${parentTweet.content}"
Author: @${parentTweet.author_username}

Write ${threadLength} connected tweets that provide additional value. Number them 1/3, 2/3, etc. Each tweet should be under 240 characters.`;
  }

  private getTemperatureForPersona(persona: Persona): number {
    switch (persona.tone) {
      case 'technical': return 0.7;
      case 'casual': return 0.9;
      case 'meme': return 1.0;
      default: return 0.8;
    }
  }

  private fallbackReply(tweet: Tweet, persona: Persona): string {
    return `Interesting point about "${tweet.content.substring(0, 50)}..." - ${persona.name} will have more insights soon!`;
  }

  private fallbackThread(parentTweet: Tweet, persona: Persona, threadLength: number): string[] {
    return Array(threadLength).fill(0).map((_, i) => 
      `Thread part ${i + 1}/${threadLength}: Building on "${parentTweet.content.substring(0, 30)}..." - more insights coming!`
    );
  }
}
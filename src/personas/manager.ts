import { Persona, Persona as PersonaType } from '../types';

export class PersonaManager {
  private personas: Map<string, Persona> = new Map();

  constructor() {
    this.initializeDefaultPersonas();
  }

  private initializeDefaultPersonas(): void {
    const defaultPersonas: Persona[] = [
      {
        name: 'CryptoSavvy',
        bio: 'Blockchain analyst | DeFi expert | Early adopter',
        expertise: ['defi', 'smart contracts', 'trading'],
        tone: 'technical',
        engagement_style: 'helpful'
      },
      {
        name: 'MemeMaster',
        bio: 'Meme lord | Trend spotter | Crypto culture',
        expertise: ['memes', 'trends', 'community'],
        tone: 'casual',
        engagement_style: 'controversial'
      },
      {
        name: 'MarketWizard',
        bio: 'Technical analyst | Chart expert | Market wizard',
        expertise: ['technical analysis', 'chart patterns', 'market cycles'],
        tone: 'technical',
        engagement_style: 'helpful'
      },
      {
        name: 'NewbieNinja',
        bio: 'Crypto beginner | Learning journey | Community builder',
        expertise: ['learning', 'community', 'education'],
        tone: 'casual',
        engagement_style: 'helpful'
      },
      {
        name: 'AlphaCaller',
        bio: 'Alpha hunter | Early mover | Profit seeker',
        expertise: ['trading signals', 'early opportunities', 'profits'],
        tone: 'casual',
        engagement_style: 'controversial'
      }
    ];

    defaultPersonas.forEach(persona => {
      this.personas.set(persona.name, persona);
    });
  }

  getPersona(name: string): Persona | undefined {
    return this.personas.get(name);
  }

  getAllPersonas(): Persona[] {
    return Array.from(this.personas.values());
  }

  addPersona(persona: Persona): void {
    this.personas.set(persona.name, persona);
  }

  removePersona(name: string): boolean {
    return this.personas.delete(name);
  }

  selectBestPersonaForTweet(tweetText: string): Persona {
    const lowerText = tweetText.toLowerCase();
    
    // Check for meme-related content
    if (lowerText.includes('elon') || lowerText.includes('doge') || lowerText.includes('shib') || lowerText.includes('to the moon')) {
      return this.getPersona('MemeMaster')!;
    }
    
    // Check for technical analysis
    if (lowerText.includes('chart') || lowerText.includes('technical') || lowerText.includes('support') || lowerText.includes('resistance')) {
      return this.getPersona('MarketWizard')!;
    }
    
    // Check for trading signals
    if (lowerText.includes('buy') || lowerText.includes('sell') || lowerText.includes('long') || lowerText.includes('short')) {
      return this.getPersona('AlphaCaller')!;
    }
    
    // Check for educational content
    if (lowerText.includes('how to') || lowerText.includes('learn') || lowerText.includes('tutorial') || lowerText.includes('guide')) {
      return this.getPersona('NewbieNinja')!;
    }
    
    // Default to CryptoSavvy
    return this.getPersona('CryptoSavvy')!;
  }

  generatePersonaBio(persona: Persona): string {
    const expertiseList = persona.expertise.join(', ');
    const toneDescriptions: Record<string, string> = {
      technical: 'Technical analysis and deep dives',
      casual: 'Casual conversations and memes',
      meme: 'Memes and viral content'
    };

    const engagementDescriptions: Record<string, string> = {
      helpful: 'Helpful and informative',
      controversial: 'Controversial and engaging',
      neutral: 'Neutral and balanced'
    };

    return `${persona.bio} | ${expertiseList} | ${toneDescriptions[persona.tone]} | ${engagementDescriptions[persona.engagement_style]}`;
  }
}
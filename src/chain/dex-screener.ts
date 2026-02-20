import axios from 'axios';
import { DEXScreenerToken } from '../types';

export class DEXScreenerAPI {
  private client: any;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.dexscreener.com',
      timeout: 10000,
    });
  }

  async getTrendingTokens(): Promise<DEXScreenerToken[]> {
    try {
      const response = await this.client.get('/tokens/trending');
      return response.data.tokens || [];
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  async getVolumeSpikes(): Promise<DEXScreenerToken[]> {
    try {
      const response = await this.client.get('/tokens/volume-spikes');
      return response.data.tokens || [];
    } catch (error) {
      console.error('Error fetching volume spikes:', error);
      return [];
    }
  }

  async getTokenDetails(address: string): Promise<DEXScreenerToken | null> {
    try {
      const response = await this.client.get(`/tokens/${address}`);
      return response.data.token || null;
    } catch (error) {
      console.error(`Error fetching token details for ${address}:`, error);
      return null;
    }
  }

  async getTopGainers(): Promise<DEXScreenerToken[]> {
    try {
      const response = await this.client.get('/tokens/gainers');
      return response.data.tokens || [];
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      return [];
    }
  }

  async getTopLosers(): Promise<DEXScreenerToken[]> {
    try {
      const response = await this.client.get('/tokens/losers');
      return response.data.tokens || [];
    } catch (error) {
      console.error('Error fetching top losers:', error);
      return [];
    }
  }

  async searchTokens(query: string): Promise<DEXScreenerToken[]> {
    try {
      const response = await this.client.get('/tokens/search', {
        params: { q: query },
      });
      return response.data.tokens || [];
    } catch (error) {
      console.error(`Error searching tokens for ${query}:`, error);
      return [];
    }
  }
}
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TwitterStream } from '../twitter/stream';
import { DEXScreenerAPI } from '../chain/dex-screener';
import { ReplyEngine } from './reply-engine';
import { Tweet, Signal, TradingExecution } from '../types';

export class TradingExecutor {
  private connection: Connection;
  private walletKeypair?: any;
  private activeTrades: Map<string, TradingExecution> = new Map();

  constructor(rpcUrl: string, privateKey?: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    if (privateKey) {
      this.walletKeypair = // Create keypair from private key
    }
  }

  async executeSignal(signal: Signal): Promise<TradingExecution> {
    try {
      const execution: TradingExecution = {
        token_address: signal.token_address,
        amount: this.calculatePositionSize(signal),
        side: signal.signal_type as 'buy' | 'sell',
        slippage: 0.5,
        deadline: new Date(Date.now() + 5 * 60 * 1000),
        status: 'pending',
        created_at: new Date()
      };

      if (signal.signal_type === 'buy') {
        const result = await this.buyToken(signal.token_address, execution.amount);
        execution.transaction_hash = result.transactionHash;
        execution.status = result.success ? 'executed' : 'failed';
      } else if (signal.signal_type === 'sell') {
        const result = await this.sellToken(signal.token_address, execution.amount);
        execution.transaction_hash = result.transactionHash;
        execution.status = result.success ? 'executed' : 'failed';
      }

      this.activeTrades.set(signal.token_address, execution);
      return execution;

    } catch (error) {
      console.error('Error executing trade:', error);
      return {
        token_address: signal.token_address,
        amount: 0,
        side: signal.signal_type as 'buy' | 'sell',
        slippage: 0,
        deadline: new Date(),
        status: 'failed',
        updated_at: new Date()
      };
    }
  }

  async buyToken(tokenAddress: string, amount: number): Promise<{ transactionHash: string; success: boolean }> {
    try {
      if (!this.walletKeypair) {
        throw new Error('No wallet configured');
      }

      const tokenPublicKey = new PublicKey(tokenAddress);
      const mintInfo = await Token.getMint(this.connection, tokenPublicKey);

      constATA_Account = await Token.getAssociatedTokenAddress(
        this.connection,
        this.walletKeypair.publicKey,
        tokenPublicKey,
        true
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.walletKeypair.publicKey,
          toPubkey: ATA_Account,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await this.connection.sendTransaction(transaction, [this.walletKeypair]);
      await this.connection.confirmTransaction(signature);

      return { transactionHash: signature, success: true };
    } catch (error) {
      console.error('Buy token error:', error);
      return { transactionHash: '', success: false };
    }
  }

  async sellToken(tokenAddress: string, amount: number): Promise<{ transactionHash: string; success: boolean }> {
    try {
      if (!this.walletKeypair) {
        throw new Error('No wallet configured');
      }

      const tokenPublicKey = new PublicKey(tokenAddress);
      const ATA_Account = await Token.getAssociatedTokenAddress(
        this.connection,
        this.walletKeypair.publicKey,
        tokenPublicKey
      );

      const tokenAccount = await this.connection.getParsedAccountInfo(ATA_Account);
      const balance = (tokenAccount.value as any).data.parsed.info.tokenAmount.uiAmount;

      if (balance < amount) {
        throw new Error(`Insufficient balance. Has ${balance}, trying to sell ${amount}`);
      }

      const transaction = new Transaction().add(
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          ATA_Account,
          this.walletKeypair.publicKey,
          this.walletKeypair.publicKey,
          BigInt(0),
          'single'
        )
      );

      const signature = await this.connection.sendTransaction(transaction, [this.walletKeypair]);
      await this.connection.confirmTransaction(signature);

      return { transactionHash: signature, success: true };
    } catch (error) {
      console.error('Sell token error:', error);
      return { transactionHash: '', success: false };
    }
  }

  getActiveTrade(tokenAddress: string): TradingExecution | undefined {
    return this.activeTrades.get(tokenAddress);
  }

  getAllActiveTrades(): TradingExecution[] {
    return Array.from(this.activeTrades.values());
  }

  private calculatePositionSize(signal: Signal): number {
    const baseAmount = 0.01;
    const confidenceMultiplier = signal.confidence_score / 100;
    const riskAdjusted = baseAmount * confidenceMultiplier;

    return Math.max(0.001, riskAdjusted);
  }
}
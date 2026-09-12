import { Injectable, Logger, Inject } from '@nestjs/common';
import { WalletRepository } from '../repository';
import { TransactionRepository } from '@app/transaction/repository/transaction.repository';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async getWalletBalance(userId: string) {
    try {
      const wallet = await this.walletRepository.findByUserId(userId);
      if (!wallet) {
        return { success: false, balance: 0 };
      }
      return {
        success: true,
        balance: Number(wallet.balance),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get balance: ${message}`);
      throw error;
    }
  }

  async getWalletTransactions(userId: string, limit = 10, offset = 0) {
    try {
      const wallet = await this.walletRepository.findByUserId(userId);
      if (!wallet) {
        return { success: false, count: 0, transactions: [] };
      }

      const transactions = await this.transactionRepository.findByWalletId(
        wallet.id,
        limit,
        offset,
      );

      return {
        success: true,
        count: transactions.length,
        transactions,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get wallet transactions: ${message}`);
      throw error;
    }
  }
}

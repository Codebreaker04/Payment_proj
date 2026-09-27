import { Injectable, Logger, Inject } from '@nestjs/common';
import { WalletRepository } from '../repository';
import { TransactionRepository } from '@app/transaction/repository/transaction.repository';
import { toAmount } from '@app/common/utils/amount.util';

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
        // The wallet id lets clients tell sent from received: transaction
        // senderId/receiverId are wallet ids, not user ids.
        walletId: wallet.id,
        currency: wallet.currency,
        balance: toAmount(wallet.balance),
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
        walletId: wallet.id,
        count: transactions.length,
        transactions: transactions.map((transaction) => ({
          ...transaction,
          amount: toAmount(transaction.amount),
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get wallet transactions: ${message}`);
      throw error;
    }
  }
}

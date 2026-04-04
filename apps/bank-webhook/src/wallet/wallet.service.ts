import { Injectable, Logger } from "@nestjs/common";
import { TransactionRepository } from "../transaction/transaction.repository";

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getWalletBalance(userId: string) {
    try {
      const balance = await this.transactionRepository.checkBalanceByUserId(userId);
      return {
        success: true,
        balance,
      };
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`);
      throw error;
    }
  }
}
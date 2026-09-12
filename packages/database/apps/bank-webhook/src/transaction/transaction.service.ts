import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { P2PTransactionRequestDto } from './dtos/request';
import { TransactionRepository } from './transaction.repository';
import { TransactionType } from '@repo/database';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private configService: ConfigService,
    private transactionRepository: TransactionRepository,
  ) {
    this.logger.log('TransactionService initialized');
    this.logger.log(
      `Using webhook secret: ${this.configService.get('WEBHOOK_SECRET')}`,
    );
  }

  async processP2PTransaction(
    transactionData: P2PTransactionRequestDto,
    user: any,
  ) {
    this.logger.log('Processing P2P transaction:', JSON.stringify(transactionData));

    try {
      // Get sender and receiver wallets
      const senderWallet = await this.transactionRepository.getWalletByUserId(user.id);
      const receiverWallet = await this.transactionRepository.getWalletByUserId(
        transactionData.receiverId,
      );

      // Check sender balance
      const senderBalance = await this.transactionRepository.checkBalance(senderWallet.id);
      this.logger.log(`Sender balance: ${senderBalance}, Amount: ${transactionData.amount}`);

      // Create transaction with balance updates
      const transaction = await this.transactionRepository.createTransaction({
        senderId: senderWallet.id,
        receiverId: receiverWallet.id,
        amount: transactionData.amount,
        type: TransactionType.P2P_Transfer,
        description: transactionData.description,
        referenceId: transactionData.idempotencyKey,
      });

      this.logger.log(`Transaction ${transaction.id} processed successfully`);

      return {
        success: true,
        message: 'P2P transaction processed successfully',
        transaction: {
          id: transaction.id,
          referenceId: transaction.referenceId,
          amount: transaction.amount,
          status: transaction.status,
          type: transaction.type,
          createdAt: transaction.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Transaction processing failed: ${error.message}`);
      throw error;
    }
  }

  async getAllTransactions() {
    // This could be enhanced to use repository method
    return {
      success: true,
      message: 'Use wallet-specific transaction queries',
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.getTransactionById(id);

    return {
      success: true,
      transaction,
    };
  }

  

  async getWalletTransactions(userId: string, limit = 50, offset = 0) {
    try {
      const wallet = await this.transactionRepository.getWalletByUserId(userId);
      const transactions = await this.transactionRepository.getWalletTransactions(
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
      this.logger.error(`Failed to get transactions: ${error.message}`);
      throw error;
    }
  }

  async verifyWebhook(payload: any) {
    const secret = this.configService.get('WEBHOOK_SECRET');
    const isValid = payload.secret === secret;

    this.logger.log(`Webhook verification: ${isValid ? 'PASSED' : 'FAILED'}`);

    return {
      success: isValid,
      message: isValid ? 'Webhook verified' : 'Invalid webhook secret',
    };
  }
}

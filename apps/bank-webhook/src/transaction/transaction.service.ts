import { Injectable, BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@app/prisma/prisma.types';
import type {
  P2PTransactionRequestDto,
  UPITransactionRequestDto,
  CardTransactionRequestDto,
  InternalTransactionRequestDto,
  UserP2PTransferRequestDto,
  VerifyWebhookDto,
  VerifyResponseDto,
} from '@repo/contracts';
import { JwtService } from '@app/common/services';
import { PrismaService } from '@app/prisma/prisma.service';
import { TransactionRepository } from './repository';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionRepository: TransactionRepository,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('TransactionService initialized');
  }

  private async createP2PTransaction(
    senderUserId: string,
    receiverUserId: string,
    amount: number,
    idempotencyKey: string,
    description?: string,
  ) {
    if (senderUserId === receiverUserId) {
      throw new BadRequestException(
        'Sender and receiver cannot be the same user',
      );
    }

    // Check idempotency
    const existingTransaction =
      await this.transactionRepository.findByReferenceId(idempotencyKey);

    if (existingTransaction) {
      return {
        success: true,
        message: 'Transaction already processed for this idempotency key',
        transaction: {
          id: existingTransaction.id,
          referenceId: existingTransaction.referenceId,
          amount: existingTransaction.amount,
          status: existingTransaction.status,
          type: existingTransaction.type,
          createdAt: existingTransaction.createdAt,
        },
      };
    }

    // Use DB transaction for atomicity
    return this.prisma.$transaction(async (tx) => {
      // Find wallets using tx client
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: senderUserId },
      });
      const receiverWallet = await tx.wallet.findUnique({
        where: { userId: receiverUserId },
      });

      if (!senderWallet || !receiverWallet) {
        throw new BadRequestException('Sender or receiver wallet not found');
      }

      // Check sender balance
      if (Number(senderWallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update sender balance (decrement)
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      });

      // Update receiver balance (increment)
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      const transaction = await this.transactionRepository.create(
        {
          referenceId: idempotencyKey,
          sender: { connect: { id: senderWallet.id } },
          receiver: { connect: { id: receiverWallet.id } },
          amount,
          type: TransactionType.P2P_Transfer,
          status: TransactionStatus.Completed,
          description: description ?? null,
        },
        tx,
      );

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
    });
  }

  async processWebhookP2PTransaction(
    transactionData: P2PTransactionRequestDto,
  ) {
    this.logger.log(
      'Processing webhook P2P transaction:',
      JSON.stringify(transactionData),
    );

    try {
      return await this.createP2PTransaction(
        transactionData.senderId,
        transactionData.receiverId,
        transactionData.amount,
        transactionData.idempotencyKey,
        transactionData?.description ?? undefined,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Webhook transaction processing failed: ${message}`);
      throw error;
    }
  }

  async processUserP2PTransaction(transactionData: UserP2PTransferRequestDto) {
    this.logger.log('Processing user P2P transaction');

    try {
      return await this.createP2PTransaction(
        transactionData.senderUserId,
        transactionData.receiverUserId,
        transactionData.amount,
        transactionData.idempotencyKey,
        transactionData?.description ?? undefined,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`User transaction processing failed: ${message}`);
      throw error;
    }
  }

  async getAllTransactions(limit = 50, offset = 0) {
    const transactions = await this.transactionRepository.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      count: transactions.length,
      transactions,
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.findById(id);

    return {
      success: true,
      transaction,
    };
  }

  async getWalletTransactions(userId: string, limit = 50, offset = 0) {
    try {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

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
      this.logger.error(`Failed to get transactions: ${message}`);
      throw error;
    }
  }

  async verifyWebhook(payload: VerifyWebhookDto): Promise<VerifyResponseDto> {
    if (!payload.token) {
      throw new BadRequestException('token is required');
    }
    const user = this.jwtService.verifyToken(payload.token);
    if (!user) {
      throw new UnauthorizedException('Unable to verify token');
    }
    this.logger.log(`JWT verification passed for user: ${user.id}`);

    return {
      success: true,
      message: 'JWT verified',
      user,
    };
  }
}

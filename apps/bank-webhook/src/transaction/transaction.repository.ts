import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, TransactionStatus, TransactionType } from '@repo/database';

export interface CreateTransactionData {
  senderId?: string;
  receiverId?: string;
  amount: number;
  type: TransactionType;
  description?: string;
  referenceId: string;
}

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check wallet balance by wallet ID
   */
  async checkBalance(walletId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return parseFloat(wallet.balance.toString());
  }

  /**
   * Check wallet balance by user ID
   */
  async checkBalanceByUserId(userId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }

    return parseFloat(wallet.balance.toString());
  }

  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for user ${userId} not found`);
    }

    return wallet;
  }

  /**
   * Create a new transaction with balance updates
   * This performs all operations in a database transaction for consistency
   */
  async createTransaction(data: CreateTransactionData) {
    const { senderId, receiverId, amount, type, description, referenceId } =
      data;

    if (amount <= 0) {
      throw new BadRequestException(
        'Transaction amount must be greater than 0',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Check if sender has sufficient balance for debit/P2P transactions
      if (
        senderId &&
        (type === TransactionType.debit ||
          type === TransactionType.P2P_Transfer)
      ) {
        const senderWallet = await tx.wallet.findUnique({
          where: { id: senderId },
        });

        if (!senderWallet) {
          throw new NotFoundException(`Sender wallet ${senderId} not found`);
        }

        const currentBalance = parseFloat(senderWallet.balance.toString());
        if (currentBalance < amount) {
          throw new BadRequestException(
            `Insufficient balance. Available: ${currentBalance}, Required: ${amount}`,
          );
        }

        // Deduct amount from sender
        await tx.wallet.update({
          where: { id: senderId },
          data: {
            balance: { decrement: amount },
          },
        });
      }

      // Credit amount to receiver for credit/P2P transactions
      if (
        receiverId &&
        (type === TransactionType.credit ||
          type === TransactionType.P2P_Transfer)
      ) {
        const receiverWallet = await tx.wallet.findUnique({
          where: { id: receiverId },
        });

        if (!receiverWallet) {
          throw new NotFoundException(
            `Receiver wallet ${receiverId} not found`,
          );
        }

        await tx.wallet.update({
          where: { id: receiverId },
          data: {
            balance: { increment: amount },
          },
        });
      }

      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          referenceId,
          senderId,
          receiverId,
          amount: new Prisma.Decimal(amount),
          type,
          status: TransactionStatus.Completed,
          description,
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      return transaction;
    });
  }

  /**
   * Update wallet balance directly (use with caution)
   */
  async updateBalance(
    walletId: string,
    amount: number,
    operation: 'increment' | 'decrement',
  ) {
    if (operation === 'decrement') {
      const wallet = await this.prisma.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet ${walletId} not found`);
      }

      const currentBalance = parseFloat(wallet.balance.toString());
      if (currentBalance < amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${currentBalance}, Required: ${amount}`,
        );
      }
    }

    return await this.prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance:
          operation === 'increment'
            ? { increment: amount }
            : { decrement: amount },
      },
    });
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Get transaction by reference ID
   */
  async getTransactionByReferenceId(referenceId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { referenceId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    return transaction;
  }

  /**
   * Get transactions for a wallet
   */
  async getWalletTransactions(walletId: string, limit = 50, offset = 0) {
    return await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: walletId }, { receiverId: walletId }],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Create or get wallet for user
   */
  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
      });
    }

    return wallet;
  }
}

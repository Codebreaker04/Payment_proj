import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from '@app/prisma/prisma.types';
import { PrismaService } from '@app/prisma/prisma.service';
import { ITransactionRepository } from '../interfaces/transaction.repository.interface';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.TransactionCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction> {
    const client = tx ?? this.prisma;
    return client.transaction.create({ data });
  }

  async findById(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction | null> {
    const client = tx ?? this.prisma;
    return client.transaction.findUnique({ where: { id } });
  }

  async findFirst(
    where: Partial<Transaction>,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction | null> {
    const client = tx ?? this.prisma;
    return client.transaction.findFirst({ where });
  }

  async findMany(
    args?: {
      where?: Prisma.TransactionWhereInput;
      orderBy?: Prisma.TransactionOrderByWithRelationInput;
      take?: number;
      skip?: number;
      select?: Prisma.TransactionSelect;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction[]> {
    const client = tx ?? this.prisma;
    return client.transaction.findMany(args);
  }

  async update(
    where: Prisma.TransactionWhereUniqueInput,
    data: Prisma.TransactionUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction> {
    const client = tx ?? this.prisma;
    return client.transaction.update({ where, data });
  }

  async delete(
    where: Prisma.TransactionWhereUniqueInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction> {
    const client = tx ?? this.prisma;
    return client.transaction.delete({ where });
  }

  async count(
    where?: Prisma.TransactionWhereInput,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    return client.transaction.count({ where });
  }

  async findByReferenceId(
    referenceId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction | null> {
    return this.findFirst({ referenceId } as Partial<Transaction>, tx);
  }

  async findByWalletId(
    walletId: string,
    limit = 50,
    offset = 0,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction[]> {
    return this.findMany(
      {
        where: {
          OR: [{ senderId: walletId }, { receiverId: walletId }],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      },
      tx,
    );
  }
}

import { Prisma } from '@app/prisma/prisma.types';
import { PrismaService } from '@app/prisma/prisma.service';
import { IWalletRepository } from '@app/wallet/interfaces';

export class WalletRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WalletCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.wallet.create({ data });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.wallet.findUnique({ where: { id } });
  }

  async findFirst(
    where: Partial<Prisma.WalletWhereInput>,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.wallet.findFirst({ where });
  }

  async findMany(
    args?: {
      where?: Prisma.WalletWhereInput;
      orderBy?: Prisma.WalletOrderByWithRelationInput;
      take?: number;
      skip?: number;
      select?: Prisma.WalletSelect;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.wallet.findMany(args);
  }

  async update(
    where: Prisma.WalletWhereUniqueInput,
    data: Prisma.WalletUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.wallet.update({ where, data });
  }

  async findByUserId(UserId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.wallet.findFirst({ where: { userId: UserId } });
  }

  async updateBalance(
    walletId: string,
    amount: number,
    operation: 'increment' | 'decrement',
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.wallet.update({
      where: { id: walletId },
      data: { balance: { [operation]: amount } },
    });
  }

  async delete(
    where: Prisma.WalletWhereUniqueInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.wallet.delete({ where });
  }

  async count(where?: Prisma.WalletWhereInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.wallet.count({ where });
  }
}

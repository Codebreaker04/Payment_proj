import { Prisma, Wallet } from '@app/prisma/prisma.types';
import { IBaseRepository } from '@app/common/interfaces/base.repository.interface';

export interface IWalletRepository extends IBaseRepository<
  Wallet,
  Prisma.WalletCreateInput,
  Prisma.WalletUpdateInput,
  Prisma.WalletWhereUniqueInput
> {
  findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Wallet | null>;

  updateBalance(
    walletId: string,
    amount: number,
    operation: 'increment' | 'decrement',
    tx?: Prisma.TransactionClient,
  ): Promise<Wallet>;
}

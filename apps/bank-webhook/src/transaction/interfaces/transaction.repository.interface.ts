import { Prisma, Transaction } from '@app/prisma/prisma.types';
import { IBaseRepository } from '@app/common/interfaces';

export interface ITransactionRepository extends IBaseRepository<
  Transaction,
  Prisma.TransactionCreateInput,
  Prisma.TransactionUpdateInput,
  Prisma.TransactionWhereUniqueInput
> {
  findByReferenceId(
    referenceId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction | null>;

  findByWalletId(
    walletId: string,
    limit?: number,
    offset?: number,
    tx?: Prisma.TransactionClient,
  ): Promise<Transaction[]>;
}

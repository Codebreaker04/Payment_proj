import { Prisma } from '@app/prisma/prisma.types';

export interface IBaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereUniqueInput,
> {
  create(data: CreateInput, tx?: Prisma.TransactionClient): Promise<T>;
  findById(id: string, tx?: Prisma.TransactionClient): Promise<T | null>;
  findFirst(
    where: Partial<T>,
    tx?: Prisma.TransactionClient,
  ): Promise<T | null>;
  findMany(
    args?: {
      where?: any;
      orderBy?: any;
      take?: number;
      skip?: number;
      select?: any;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<T[]>;
  update(
    where: WhereUniqueInput,
    data: UpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<T>;
  delete(where: WhereUniqueInput, tx?: Prisma.TransactionClient): Promise<T>;
  count(where?: any, tx?: Prisma.TransactionClient): Promise<number>;
}

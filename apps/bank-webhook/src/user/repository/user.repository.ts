import { Prisma } from '@app/prisma/prisma.types';
import { PrismaService } from '@app/prisma/prisma.service';
import { IUserRepository } from '@app/user/interfaces';

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.create({ data });
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.findUnique({ where: { email } });
  }

  async findFirst(
    where: Partial<Prisma.UserWhereInput>,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.user.findFirst({ where });
  }

  async findMany(
    args?: {
      where?: Prisma.UserWhereInput;
      orderBy?: Prisma.UserOrderByWithRelationInput;
      take?: number;
      skip?: number;
      select?: Prisma.UserSelect;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.user.findMany(args);
  }

  async update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.user.update({ where, data });
  }

  async delete(
    where: Prisma.UserWhereUniqueInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    return client.user.update({ where, data: { deletedAt: new Date() } });
  }

  async count(where?: Prisma.UserWhereInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.count({ where });
  }
}

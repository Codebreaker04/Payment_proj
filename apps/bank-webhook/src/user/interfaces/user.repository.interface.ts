import { Prisma, User } from '@app/prisma/prisma.types';
import { IBaseRepository } from '@app/common/interfaces/base.repository.interface';
import { UpdateProfileDto } from '@app/user/dtos/update-profile.dto';
import { UpdateSettingsDto } from '@app/user/dtos/update-settings.dto';

export interface IUserRepository extends IBaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput
> {
  findByEmail(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User | null>;

  // findOrCreateSettings(
  //   userId: string,
  //   tx?: Prisma.TransactionClient,
  // ): Promise<UserSettings>;

  // upsertSettings(
  //   userId: string,
  //   data: UpdateSettingsDto,
  //   tx?: Prisma.TransactionClient,
  // ): Promise<UserSettings>;
}

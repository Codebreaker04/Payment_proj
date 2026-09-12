import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserRepository } from './repository';
import { UserService } from './services/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}

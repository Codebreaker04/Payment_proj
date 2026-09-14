import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './repository/transaction.repository';
import { PrismaModule } from '@app/prisma/prisma.module';
import { JwtAuthGuard } from '@app/guards/jwt-auth.guard';
import { CommonModule } from '@app/common/common.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [PrismaModule, CommonModule, UserModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository, JwtAuthGuard],
  exports: [TransactionRepository],
})
export class TransactionModule {}

import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './repository/transaction.repository';
import { PrismaModule } from '@app/prisma/prisma.module';
import { JwtAuthGuard } from '@app/guards/jwt-auth.guard';
import { CommonModule } from '@app/common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository, JwtAuthGuard],
  exports: [TransactionRepository],
})
export class TransactionModule {}

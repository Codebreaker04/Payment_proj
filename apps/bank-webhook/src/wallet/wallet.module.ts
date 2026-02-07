import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionRepository } from '../transaction/transaction.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [TransactionService, TransactionRepository],
})
export class WalletModule {}

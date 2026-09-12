import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './services/wallet.service';
import { WalletRepository } from './repository';
import { TransactionModule } from '@app/transaction/transaction.module';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule, TransactionModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletRepository],
})
export class WalletModule {}

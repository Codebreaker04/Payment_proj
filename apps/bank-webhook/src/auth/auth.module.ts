import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/user.module';
import { WalletModule } from '@app/wallet/wallet.module';
import { TransactionModule } from '@app/transaction/transaction.module';
import { AuthController } from './auth.controller';
import { AuthenticationService } from './auth.service';

@Module({
  imports: [PrismaModule, UserModule, WalletModule, TransactionModule],
  controllers: [AuthController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthModule {}

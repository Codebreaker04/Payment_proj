import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { RequestLoggerMiddleware } from '@app/common/middleware/request-logger.middleware';
import { TransactionModule } from '@app/transaction/transaction.module';
import { WalletModule } from '@app/wallet/wallet.module';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/user.module';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TransactionModule,
    WalletModule,
    UserModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applied before guards so rejected requests (401/403/404) are logged too.
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

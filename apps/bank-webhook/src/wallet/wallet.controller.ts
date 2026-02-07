import { Controller, Get, Param } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('balance/:userId')
  async getBalance(@Param('userId') userId: string) {
    return this.transactionService.getWalletBalance(userId);
  }

  @Get('transactions/:userId')
  async getTransactions(@Param('userId') userId: string) {
    return this.transactionService.getWalletTransactions(userId);
  }
}

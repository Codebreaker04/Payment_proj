import { Controller, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance/:userId')
  async getBalance(@Param('userId') userId: string) {
    return this.walletService.getWalletBalance(userId);
  }

  @Get('transactions/:userId')
  async getTransactions(@Param('userId') userId: string) {
    // TODO: Move this to WalletService
    return { message: 'Not implemented yet' };
  }
}

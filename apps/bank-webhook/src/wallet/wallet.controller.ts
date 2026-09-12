import { Controller, Get, Param, Query, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { WalletService } from './services';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance/:userId')
  async getBalance(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.walletService.getWalletBalance(userId);
  }

  @Get('transactions/:userId')
  async getTransactions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.walletService.getWalletTransactions(userId, limit, offset);
  }
}

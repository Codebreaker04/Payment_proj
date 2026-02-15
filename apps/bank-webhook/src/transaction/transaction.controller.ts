import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  InitiateTransactionRequestDto,
  PaymentMethod,
  P2PTransactionRequestDto,
  UPITransactionRequestDto,
  CardTransactionRequestDto,
  InternalTransactionRequestDto,
} from './dtos/request';
import { WebhookAuthGuard } from '../guards/webhook-auth.guard';

@Controller('webhook')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transaction')
  @UseGuards(WebhookAuthGuard)
  @HttpCode(HttpStatus.OK)
  async handleTransaction(
    @Body() transactionData: InitiateTransactionRequestDto,
    @Req() req: any,
  ) {
    switch (transactionData.paymentMethod) {
      case PaymentMethod.P2P:
        return await this.transactionService.processP2PTransaction(
          transactionData as P2PTransactionRequestDto,
          req.user,
        );
      default:
        return {
          success: false,
          message: `Payment method ${transactionData.paymentMethod} not yet implemented`,
        };
    }
  }

  @Get('transactions')
  async getAllTransactions() {
    return this.transactionService.getAllTransactions();
  }

  @Get('transaction/:id')
  async getTransaction(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyWebhook(@Body() payload: any) {
    return this.transactionService.verifyWebhook(payload);
  }
}

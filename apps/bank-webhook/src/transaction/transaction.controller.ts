import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  UsePipes,
  NotImplementedException,
  Req,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import type {
  VerifyWebhookDto,
  P2PTransactionRequestDto,
  UPITransactionRequestDto,
  CardTransactionRequestDto,
  InternalTransactionRequestDto,
  InitiateTransactionRequestDto,
  UserP2PTransferRequestDto,
} from '@repo/contracts';
import {
  InitiateTransactionSchema,
  UserP2PTransferSchema,
  VerifyWebhookSchema,
} from '@repo/contracts';
import { JwtAuthGuard } from '@app/guards/jwt-auth.guard';
import { ZodValidationPipe } from '@app/pipes/zod-validation.pipe';

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('webhook/transaction')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(InitiateTransactionSchema))
  async handleWebhookTransaction(
    @Body() InitiateTransactionRequestBody: InitiateTransactionRequestDto,
    @Req() request: any,
  ) {
    switch (InitiateTransactionRequestBody.paymentMethod) {
      case 'P2P':
        return await this.transactionService.processWebhookP2PTransaction(
          InitiateTransactionRequestBody as P2PTransactionRequestDto,
        );
      default:
        throw new NotImplementedException(
          `Payment method ${InitiateTransactionRequestBody.paymentMethod} is not implemented yet`,
        );
    }
  }

  @Post('transaction/transfer')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(UserP2PTransferSchema))
  async handleUserTransfer(
    @Body() UserP2PTransferRequestBody: UserP2PTransferRequestDto,
  ) {
    return this.transactionService.processUserP2PTransaction(
      UserP2PTransferRequestBody,
    );
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getAllTransactions(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.transactionService.getAllTransactions(limit, offset);
  }

  @Get('webhook/transaction/:id')
  @UseGuards(JwtAuthGuard)
  async getTransaction(@Param('id') id: string) {
    return this.transactionService.getTransactionById(id);
  }

  @Post('verify')
  @UsePipes(new ZodValidationPipe(VerifyWebhookSchema))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyWebhook(@Body() verifyWebhookPayload: VerifyWebhookDto) {
    return this.transactionService.verifyWebhook(verifyWebhookPayload);
  }
}

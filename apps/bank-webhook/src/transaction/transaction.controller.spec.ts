import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '@app/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from '@app/auth/auth.service';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            processWebhookP2PTransaction: jest.fn(),
            processUserP2PTransaction: jest.fn(),
            getAllTransactions: jest.fn(),
            getTransactionById: jest.fn(),
            verifyWebhook: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: AuthenticationService,
          useValue: { verifyJwtToken: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => '') },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

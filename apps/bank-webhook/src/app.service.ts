import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface HealthResponse {
  status: 'healthy';
  service: 'bank-webhook';
  timestamp: string;
  environment: {
    port: string | undefined;
    hasJwtSecret: boolean;
  };
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Bank Webhook Service - Ready to handle transactions';
  }

  getHealth(): HealthResponse {
    const port = this.configService.get<string>('PORT');
    const hasJwtSecret = Boolean(this.configService.get<string>('JWT_SECRET'));

    return {
      status: 'healthy',
      service: 'bank-webhook',
      timestamp: new Date().toISOString(),
      environment: {
        port,
        hasJwtSecret,
      },
    };
  }
}

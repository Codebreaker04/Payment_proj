import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    return 'Bank Webhook Service - Ready to handle transactions';
  }

  getHealth(): any {
    return {
      status: 'healthy',
      service: 'bank-webhook',
      timestamp: new Date().toISOString(),
      environment: {
        port: this.configService.get('PORT'),
        hasWebhookSecret: !!this.configService.get('WEBHOOK_SECRET'),
      },
    };
  }
}

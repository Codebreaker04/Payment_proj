import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebhookAuthGuard.name);
  private readonly allowedIPs: string[];

  constructor(private configService: ConfigService) {
    // In production, load from environment variable
    this.allowedIPs = (this.configService.get('ALLOWED_WEBHOOK_IPS') || '')
      .split(',')
      .filter(Boolean);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-webhook-signature'];
    const timestamp = request.headers['x-webhook-timestamp'];
    const requestId = request.headers['x-webhook-id'];

    // 1. Check IP whitelist (if configured)
    if (this.allowedIPs.length > 0) {
      const clientIP = request.ip || request.connection.remoteAddress;
      if (!this.allowedIPs.includes(clientIP)) {
        this.logger.warn(`Rejected request from unauthorized IP: ${clientIP}`);
        throw new UnauthorizedException('Unauthorized IP address');
      }
    }

    // 2. Validate required headers
    if (!signature || !timestamp || !requestId) {
      this.logger.warn('Missing required webhook headers');
      throw new UnauthorizedException('Missing webhook authentication headers');
    }

    // 3. Check timestamp (prevent replay attacks)
    const currentTime = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(currentTime - requestTime);

    if (isNaN(requestTime) || timeDiff > 300000) {
      // 5 minutes
      this.logger.warn(`Request expired or invalid timestamp: ${timestamp}`);
      throw new UnauthorizedException('Request expired or invalid timestamp');
    }

    // 4. Verify HMAC signature
    try {
      const secret = this.configService.get('WEBHOOK_SECRET');
      if (!secret) {
        this.logger.error('WEBHOOK_SECRET not configured');
        throw new UnauthorizedException('Server configuration error');
      }

      const payload = JSON.stringify(request.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${requestId}.${payload}`)
        .digest('hex');

      if (signature !== expectedSignature) {
        this.logger.warn('Invalid webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // 5. Check for duplicate requests (idempotency)
      // In production, you should check Redis or database for this requestId
      // For now, we'll just attach it to the request
      request.webhookId = requestId;

      this.logger.log(`Webhook authenticated successfully: ${requestId}`);
      return true;
    } catch (error) {
      this.logger.error(`Webhook authentication failed: ${error.message}`);
      throw new UnauthorizedException('Webhook authentication failed');
    }
  }
}

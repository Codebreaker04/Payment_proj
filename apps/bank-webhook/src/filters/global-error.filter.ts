import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// Global error handler — every failure is serialized as the same envelope
// the contract response DTOs use: `{ success: false, message }`.
// Clients parse the response ONCE and read `message` for both success and
// failure instead of special-casing NestJS's default error body.
@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalErrorFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const status = this.extractStatus(exception);
    const message = this.extractMessage(exception, status);
    const context = `${request?.method ?? '-'} ${request?.originalUrl ?? '-'} status=${status} message=${JSON.stringify(message)}`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Request failed: ${context}`,
        exception instanceof Error ? exception : undefined,
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      // 4xx used to be dropped entirely, so every rejected request (401 from
      // JwtAuthGuard, 403, 404, 400) left no trace of its reason. Log it.
      this.logger.warn(`Request rejected: ${context}`);
    }

    response.status(status).json({
      success: false,
      message,
    });
  }

  // `instanceof HttpException` can fail when a second copy of
  // `@nestjs/common` is resolved (npm workspace shadowing): the thrown
  // `UnauthorizedException` is then a different class than the one this
  // filter imports, which silently turned every 4xx into a 500. Detect the
  // NestJS exception contract structurally instead.
  private isHttpExceptionShape(exception: unknown): boolean {
    return (
      typeof (exception as HttpException).getStatus === 'function' &&
      typeof (exception as HttpException).getResponse === 'function'
    );
  }

  private extractStatus(exception: unknown): number {
    if (this.isHttpExceptionShape(exception)) {
      try {
        const status = (exception as HttpException).getStatus();
        if (typeof status === 'number' && status >= 100 && status < 600) {
          return status;
        }
      } catch {
        // malformed getStatus() — fall through to 500
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractMessage(exception: unknown, status: number): string {
    if (this.isHttpExceptionShape(exception)) {
      try {
        const body = (exception as HttpException).getResponse();

        if (typeof body === 'string' && body.length > 0) {
          return body;
        }

        if (body && typeof body === 'object') {
          const rawMessage = (body as { message?: unknown }).message;
          if (Array.isArray(rawMessage)) {
            const parts = rawMessage.filter(
              (part): part is string => typeof part === 'string',
            );
            if (parts.length > 0) {
              return parts.join(', ');
            }
          } else if (typeof rawMessage === 'string' && rawMessage.length > 0) {
            return rawMessage;
          }

          const rawError = (body as { error?: unknown }).error;
          if (typeof rawError === 'string' && rawError.length > 0) {
            return rawError;
          }
        }
      } catch {
        // malformed getResponse() — fall through to fallback
      }
    }

    return 'An unexpected error occurred';
  }
}
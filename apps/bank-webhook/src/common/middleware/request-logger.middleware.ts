import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Access log for every request, including ones rejected by guards.
 *
 * A Nest interceptor cannot do this: interceptors run after guards, so 4xx
 * rejections from JwtAuthGuard (and 404s, 400s) never reach them. A
 * middleware registered for '*' runs before guards, and listening on the
 * response 'finish' event captures the final status code even when Nest's
 * error pipeline short-circuits the handler.
 *
 * Only metadata is logged — never the request body (transfer payloads can
 * contain card numbers, per the transaction contract).
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = process.hrtime.bigint();
    const ip = req.ip || req.socket?.remoteAddress || '-';

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      const { statusCode } = res;
      const line =
        `${method} ${originalUrl} ${statusCode} ` +
        `${durationMs.toFixed(2)}ms ip=${ip} ua=${req.get('user-agent') ?? '-'}`;

      if (statusCode >= 500) {
        this.logger.error(line);
      } else if (statusCode >= 400) {
        this.logger.warn(line);
      } else {
        this.logger.log(line);
      }
    });

    next();
  }
}
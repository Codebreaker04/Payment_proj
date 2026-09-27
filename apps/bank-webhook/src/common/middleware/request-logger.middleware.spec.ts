import { Logger } from '@nestjs/common';
import { RequestLoggerMiddleware } from './request-logger.middleware';

describe('RequestLoggerMiddleware', () => {
  let middleware: RequestLoggerMiddleware;

  beforeEach(() => {
    middleware = new RequestLoggerMiddleware();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Drives the middleware with a fake Express req/res and fires the 'finish'
  // event the middleware listens on.
  const run = (statusCode: number) => {
    const listeners: Record<string, () => void> = {};
    const req = {
      method: 'POST',
      originalUrl: '/transaction/transfer',
      ip: '127.0.0.1',
      socket: {},
      get: () => 'jest-agent',
    };
    const res = {
      statusCode,
      on: (event: string, cb: () => void) => {
        listeners[event] = cb;
      },
    };

    const next = jest.fn();
    middleware.use(req as never, res as never, next);

    const finish = listeners['finish'];
    if (!finish) {
      throw new Error('middleware did not register a finish listener');
    }
    finish();
    return next;
  };

  const loggedLine = (spy: jest.SpyInstance): string =>
    String(spy.mock.calls[0]?.[0] ?? '');

  it('calls next() so the request continues', () => {
    expect(run(200)).toHaveBeenCalledTimes(1);
  });

  it('logs a successful request at log level', () => {
    const log = jest.spyOn(Logger.prototype, 'log');
    run(200);

    expect(log).toHaveBeenCalledTimes(1);
    const line = loggedLine(log);
    expect(line).toContain('POST /transaction/transfer');
    expect(line).toContain('200');
    expect(line).toContain('ip=127.0.0.1');
  });

  // The whole point of using a middleware instead of an interceptor: guard
  // rejections (401/403) reach it, so they are no longer silent.
  it('logs a 4xx rejection at warn level', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn');
    run(401);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(loggedLine(warn)).toContain('401');
  });

  it('logs a 5xx failure at error level', () => {
    const error = jest.spyOn(Logger.prototype, 'error');
    run(500);

    expect(error).toHaveBeenCalledTimes(1);
    expect(loggedLine(error)).toContain('500');
  });

  it('never logs the request body', () => {
    const log = jest.spyOn(Logger.prototype, 'log');
    run(200);

    expect(loggedLine(log)).not.toContain('body');
  });
});

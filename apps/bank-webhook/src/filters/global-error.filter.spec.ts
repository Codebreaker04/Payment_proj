import { UnauthorizedException, HttpStatus, Logger } from '@nestjs/common';
import { GlobalErrorFilter } from './global-error.filter';

describe('GlobalErrorFilter', () => {
  let filter: GlobalErrorFilter;

  beforeEach(() => {
    filter = new GlobalErrorFilter();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const hostWith = (status: jest.Mock, json: jest.Mock): any => {
    status.mockReturnValue({ json });
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
        getRequest: () => ({ method: 'GET', originalUrl: '/test' }),
      }),
    };
  };

  it('keeps the 401 status code of UnauthorizedException', () => {
    const status = jest.fn();
    const json = jest.fn();
    filter.catch(
      new UnauthorizedException('Invalid email or password'),
      hostWith(status, json),
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid email or password',
    });
  });

  it('detects NestJS exceptions from a duplicated @nestjs/common instance', () => {
    // Mimics UnauthorizedException WITHOUT sharing the class identity —
    // exactly what happens when a second copy of @nestjs/common is resolved.
    const lookalike = {
      getStatus: () => HttpStatus.UNAUTHORIZED,
      getResponse: () => ({
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
      }),
    };

    const status = jest.fn();
    const json = jest.fn();
    filter.catch(lookalike, hostWith(status, json));

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid email or password',
    });
  });

  it('falls back to 500 for non-HTTP errors', () => {
    const status = jest.fn();
    const json = jest.fn();
    filter.catch(new Error('boom'), hostWith(status, json));

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'An unexpected error occurred',
    });
  });

  // 4xx used to be logged nowhere, so a rejected request was undiagnosable.
  it('logs a warning with the reason for a 4xx rejection', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn');
    const status = jest.fn();
    const json = jest.fn();

    filter.catch(
      new UnauthorizedException('Missing Authorization header'),
      hostWith(status, json),
    );

    expect(warn).toHaveBeenCalledTimes(1);
    const logged = String(warn.mock.calls[0]?.[0] ?? '');
    expect(logged).toContain('Request rejected');
    expect(logged).toContain('GET /test');
    expect(logged).toContain('status=401');
    expect(logged).toContain('Missing Authorization header');
  });

  it('logs an error for a 5xx failure', () => {
    const error = jest.spyOn(Logger.prototype, 'error');
    const status = jest.fn();
    const json = jest.fn();

    filter.catch(new Error('boom'), hostWith(status, json));

    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0] ?? '')).toContain('Request failed');
  });
});

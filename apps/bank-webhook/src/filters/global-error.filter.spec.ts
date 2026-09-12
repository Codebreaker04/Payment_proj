import { UnauthorizedException, HttpStatus } from '@nestjs/common';
import { GlobalErrorFilter } from './global-error.filter';

describe('GlobalErrorFilter', () => {
  let filter: GlobalErrorFilter;

  beforeEach(() => {
    filter = new GlobalErrorFilter();
  });

  const hostWith = (status: jest.Mock, json: jest.Mock): any => {
    status.mockReturnValue({ json });
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
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
});
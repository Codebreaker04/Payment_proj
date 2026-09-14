import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard, AuthenticatedRequest } from './jwt-auth.guard';
import { JwtService } from '@app/common/services';
import { UserRepository } from '@app/user/repository';
import { ValidatedUser } from '@app/common/models';

describe('JwtAuthGuard', () => {
  let jwtService: { verifyToken: jest.Mock };
  let userRepository: { findById: jest.Mock };
  let guard: JwtAuthGuard;

  const buildValidatedUser = (tokenVersion: number) => {
    const user = new ValidatedUser();
    user.id = 'user-1';
    user.email = 'user@example.com';
    user.name = 'User One';
    user.tokenVersion = tokenVersion;
    return user;
  };

  const makeContext = (
    authorization: string | undefined = 'Bearer test-token',
  ): ExecutionContext => {
    const request = {
      headers: { authorization },
    } as AuthenticatedRequest;
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jwtService = { verifyToken: jest.fn() };
    userRepository = { findById: jest.fn() };
    guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      userRepository as unknown as UserRepository,
    );
  });

  it('passes when the token version matches the current user version', async () => {
    jwtService.verifyToken.mockReturnValue(buildValidatedUser(2));
    userRepository.findById.mockResolvedValue({ tokenVersion: 2 });

    await expect(
      guard.canActivate(makeContext()),
    ).resolves.toBe(true);
    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
  });

  it('rejects when the user no longer exists', async () => {
    jwtService.verifyToken.mockReturnValue(buildValidatedUser(2));
    userRepository.findById.mockResolvedValue(null);

    await expect(guard.canActivate(makeContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a stale token after logout bumped the version', async () => {
    jwtService.verifyToken.mockReturnValue(buildValidatedUser(2));
    userRepository.findById.mockResolvedValue({ tokenVersion: 3 });

    await expect(guard.canActivate(makeContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects when the Authorization header is missing', async () => {
    await expect(guard.canActivate(makeContext(undefined))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
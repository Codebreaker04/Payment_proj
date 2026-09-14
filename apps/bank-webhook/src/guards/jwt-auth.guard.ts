import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@app/common/services';
import { UserRepository } from '@app/user/repository';

export type AuthenticatedRequest = Request & {
  user?: any;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);
    const validated = this.jwtService.verifyToken(token);

    if (!validated) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Revocation check: every token is signed with the user's tokenVersion
    // at issue time. Logout (or any future action) bumps the stored version,
    // which instantly invalidates all previously issued tokens. The user row
    // must exist and its version must match the token's claim.
    const dbUser = await this.userRepository.findById(validated.id);
    if (!dbUser || dbUser.tokenVersion !== validated.tokenVersion) {
      throw new UnauthorizedException('Token is no longer valid');
    }

    request.user = validated;
    return true;
  }

  private extractBearerToken(
    authHeader: string | string[] | undefined,
  ): string {
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

    if (!headerValue) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = headerValue.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Authorization header must be in Bearer token format',
      );
    }

    return token;
  }
}
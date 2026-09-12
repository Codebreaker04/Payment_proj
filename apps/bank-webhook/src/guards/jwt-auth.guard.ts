import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@app/common/services';

type AuthenticatedRequest = Request & {
  user?: any;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);
    request.user = this.jwtService.verifyToken(token);
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

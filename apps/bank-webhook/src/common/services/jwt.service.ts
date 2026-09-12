import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IJwtService } from '../interfaces/jwt.service.interface';
import { ValidatedUser } from '../models';

@Injectable()
export class JwtService implements IJwtService {
  private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 24 * 60 * 60;
  constructor(private readonly configService: ConfigService) {}

  verifyToken(token: string): ValidatedUser | null {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    let decoded: string | JwtPayload;
    try {
      decoded = verify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const payload = decoded as Record<string, unknown>;
    const userId = this.extractUserId(payload);
    const email = this.extractRequiredString(payload, 'email');
    const name = this.extractRequiredString(payload, 'name');

    return {
      id: userId,
      email: email,
      name: name,
    };
  }

  private extractUserId(payload: Record<string, unknown>): string {
    const userId =
      this.extractOptionalString(payload, 'userId') ??
      this.extractOptionalString(payload, 'id') ??
      this.extractOptionalString(payload, 'sub');

    if (!userId) {
      throw new UnauthorizedException(
        'Token payload must include userId, id, or sub',
      );
    }

    return userId;
  }

  private extractOptionalString(
    payload: Record<string, unknown>,
    key: string,
  ): string | undefined {
    const value = payload[key];
    return typeof value === 'string' ? value : undefined;
  }

  private extractRequiredString(
    payload: Record<string, unknown>,
    key: string,
  ): string {
    const value = this.extractOptionalString(payload, key);
    if (!value) {
      throw new UnauthorizedException(`Token payload must include ${key}`);
    }
    return value;
  }

  public signToken(userId: string, email: string, name: string | null): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    return sign(
      {
        userId,
        email,
        name,
      },
      secret,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    );
  }
}

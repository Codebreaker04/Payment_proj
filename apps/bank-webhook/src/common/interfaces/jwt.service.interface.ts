import { ValidatedUser } from '../models';

export interface IJwtService {
  signToken(
    userId: string,
    email: string,
    name: string | null,
    tokenVersion: number,
  ): string;
  verifyToken(token: string, options?: any): ValidatedUser | null;
}

import { ValidatedUser } from '../models';

export interface IJwtService {
  signToken(userId: string, email: string, name: string | null): string;
  verifyToken(token: string, options?: any): ValidatedUser | null;
}

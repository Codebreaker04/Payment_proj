import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@app/prisma/prisma.types';
import bcrypt from 'bcrypt';
import { PrismaService } from '@app/prisma/prisma.service';
import { IAuthService } from './interfaces';
import {
  LoginRequestDto,
  SignupRequestDto,
  LoginResponseDto,
  SignupResponseDto,
} from '@repo/contracts';
import { UserRepository } from '@app/user/repository';
import { WalletRepository } from '@app/wallet/repository';
import { TransactionRepository } from '@app/transaction/repository';
import { JwtService } from '@app/common/services';

@Injectable()
export class AuthenticationService implements IAuthService {
  constructor(
    // private readonly logger: Logger('AuthenticationService', { timestamp: true }),
    private readonly jwtService: JwtService,
    private userRepository: UserRepository,
    private walletRepository: WalletRepository,
    private transactionRepository: TransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async register(payload: SignupRequestDto): Promise<SignupResponseDto> {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await this.userRepository.create(
          {
            email: payload.email,
            name: payload.name,
            password: hashedPassword,
          },
          tx,
        );

        await this.walletRepository.create(
          {
            userId: newUser.id,
            balance: 0,
            currency: 'USD',
          },
          tx,
        );
        return newUser;
      });

      return {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken: this.jwtService.signToken(
          user.id,
          user.email,
          user.name,
          user.tokenVersion,
        ),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: credentials.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        tokenVersion: true,
      },
    });

    if (!user?.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwtService.signToken(
      user.id,
      user.email,
      user.name,
      user.tokenVersion
    );

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    // Bumping tokenVersion instantly invalidates every token issued for this
    // user before this moment — including the one that authorized this call.
    await this.userRepository.update(
      { id: userId },
      { tokenVersion: { increment: 1 } },
    );
  }
}

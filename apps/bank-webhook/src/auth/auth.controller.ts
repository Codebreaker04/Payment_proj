import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginRequestSchema, SignupRequestSchema } from '@repo/contracts';
import type {
  LoginRequestDto,
  SignupRequestDto,
  LoginResponseDto,
  SignupResponseDto,
} from '@repo/contracts';
import { ZodValidationPipe } from '@app/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '@app/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '@app/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginRequestSchema))
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() LoginRequestBody: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    return this.authenticationService.login(LoginRequestBody);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @ApiOperation({ summary: 'Sign up a user' })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UsePipes(new ZodValidationPipe(SignupRequestSchema))
  async signup(@Body() payload: SignupRequestDto): Promise<SignupResponseDto> {
    const parsed = SignupRequestSchema.parse(payload);
    return this.authenticationService.register(parsed);
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Log out — revokes all active tokens' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ success: true }> {
    await this.authenticationService.logout(request.user.id);
    return { success: true };
  }
}

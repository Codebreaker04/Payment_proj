import type {
  LoginResponseDto,
  SignupResponseDto,
  LoginRequestDto,
  SignupRequestDto,
} from '@repo/contracts';

export interface IAuthService {
  register(payload: SignupRequestDto): Promise<SignupResponseDto>;
  login(payload: LoginRequestDto): Promise<LoginResponseDto>;
}

import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { Prisma } from '@app/prisma/prisma.types';
import { UpdateProfileDto } from '@repo/contracts';
import { UpdateSettingsDto } from '@repo/contracts';
import { UserRepository } from '@app/user/repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string) {
    const profile = await this.userRepository.findById(userId);
    return { success: true, profile };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      const profile = await this.userRepository.update({ id: userId }, data);
      return { success: true, profile };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email or phone already in use');
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update profile: ${message}`);
      throw error;
    }
  }

  // async getSettings(userId: string) {
  //   const settings = await this.userRepository.findOrCreateSettings(userId);
  //   return { success: true, settings };
  // }

  // async updateSettings(userId: string, data: UpdateSettingsDto) {
  //   const settings = await this.userRepository.upsertSettings(userId, data);
  //   return { success: true, settings };
  // }
}

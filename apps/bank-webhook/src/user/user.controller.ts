import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UpdateProfileSchema, UpdateSettingsSchema } from '@repo/contracts';
import type { UpdateProfileDto, UpdateSettingsDto } from '@repo/contracts';
import { UserService } from './services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('profile/:userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() data: unknown,
  ) {
    const parsed = UpdateProfileSchema.parse(data);
    return this.userService.updateProfile(userId, parsed);
  }

  // @Get('settings/:userId')
  // async getSettings(@Param('userId') userId: string) {
  //   return this.userService.getSettings(userId);
  // }

  // @Put('settings/:userId')
  // async updateSettings(
  //   @Param('userId') userId: string,
  //   @Body() data: unknown,
  // ) {
  //   const parsed = UpdateSettingsSchema.parse(data);
  //   return this.userService.updateSettings(userId, parsed);
  // }
}

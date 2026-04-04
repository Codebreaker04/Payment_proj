import { PrismaClient } from '@repo/database';
import { Global, Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

@Global()
@Injectable()
export class PrismaService extends PrismaClient {
  private static instance: PrismaService;

  private constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }

  static getPrismaClient = (): PrismaService => {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }

    return PrismaService.instance;
  };
}

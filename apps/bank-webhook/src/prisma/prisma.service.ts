import { PrismaClient } from '@repo/database';
import { Global, Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

@Global()
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }
}

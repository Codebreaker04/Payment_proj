import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => PrismaService.getPrismaClient(),
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}

import { Module, Global } from '@nestjs/common';
import { JwtService } from './services/jwt.service';

@Global()
@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class CommonModule {}
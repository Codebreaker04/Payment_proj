import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  app.enableCors();
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  logger.log(`Bank Webhook Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Webhook Secret: ${process.env.WEBHOOK_SECRET}`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalErrorFilter } from './filters/global-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security: Helmet for HTTP headers
  app.use(helmet());

  // CORS configuration for production
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction ? (process.env.ALLOWED_ORIGINS || '').split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global error filter — every failure returns { success: false, message }
  // matching the contract response DTOs.
  app.useGlobalFilters(new GlobalErrorFilter());

  const port = process.env.PORT ?? 3002;
  await app.listen(port);

  logger.log(
    `Bank Webhook Application is running on: http://localhost:${port}`,
  );
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`CORS Origin: ${isProduction ? 'Configured' : 'All (*)'}`);
  // Never log secrets in production!
  if (!isProduction) {
    logger.warn('⚠️  Development mode - Secrets visible in logs');
  }
}
void bootstrap();

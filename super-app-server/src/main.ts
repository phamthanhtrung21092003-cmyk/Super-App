import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino Logger
  app.useLogger(app.get(Logger));

  // Enable CORS
  app.enableCors();

  // Set Global API Prefix
  app.setGlobalPrefix('api');

  // Enable API Versioning (e.g. /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Use Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter(app.get(Logger)));

  // Use Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger API Documentation at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Super App API')
    .setDescription('Tài liệu API dành cho Super-App (User) và Driver-App')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT Token của bạn',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  // Log startup using Pino Logger
  const loggerInstance = app.get(Logger);
  loggerInstance.log(`Server is running on: http://localhost:${port}`);
  loggerInstance.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();

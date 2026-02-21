import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const corsOrigin = config.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  try {
    const swagger = new DocumentBuilder()
      .setTitle('OrderBridge API')
      .setDescription('Marketplace API for sellers and orders')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('swagger', app, document);
  } catch (e) {
    console.warn('Swagger setup skipped:', (e as Error).message);
  }

  const basePort = Number(config.get<number>('PORT', 4000)) || 4000;
  const maxAttempts = 20;
  let port = basePort;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    port = basePort + attempt;
    try {
      await app.listen(port);
      console.log(`API running on http://localhost:${port}, Swagger: http://localhost:${port}/swagger`);
      return;
    } catch (e: any) {
      if (e?.code === 'EADDRINUSE' && attempt < maxAttempts - 1) continue;
      throw e;
    }
  }
}

bootstrap().catch(console.error);

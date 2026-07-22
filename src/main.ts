import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import type { Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );
  app.use(compression());
  app.enableCors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableShutdownHooks();

  if (env.SWAGGER_ENABLED) {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'),
    ) as { version: string };
    const config = new DocumentBuilder()
      .setTitle('ReconXi API')
      .setDescription('AI-powered financial records reconciliation system')
      .setVersion(packageJson.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        deepLinking: true,
        filter: true,
      },
    });
  }

  await app.listen(env.PORT, env.HOST);

  const isDev = env.NODE_ENV === 'development';
  const appUrl = `${isDev ? 'http' : 'https'}://${env.HOST}:${env.PORT}`;
  const logger = new Logger('Bootstrap');
  logger.log({
    message: `ReconXi API is running on ${appUrl}`,
    port: env.PORT,
    host: env.HOST,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });

  if (env.SWAGGER_ENABLED) logger.log(`Swagger docs: ${appUrl}/api/docs`);
}

void bootstrap();

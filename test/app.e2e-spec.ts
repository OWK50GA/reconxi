import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { HealthModule } from '../src/modules/health/health.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
      defaultVersion: '1',
    });
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  describe('Health', () => {
    it('GET /api/v1/health → 200', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as {
            success: boolean;
            message: string;
            data: { status: string };
            meta: { timestamp: string };
          };

          expect(body.success).toBe(true);
          expect(body.message).toBe('Resource retrieved successfully');
          expect(body.data.status).toBe('ok');
          expect(body.meta.timestamp).toBeDefined();
        });
    });

    it('GET /health → 404 (because of global API prefix and versioning)', () => {
      return request(app.getHttpServer()).get('/health').expect(404);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});

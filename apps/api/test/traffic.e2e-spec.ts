import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('TrafficController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Note: For a real e2e test, we'd mock the DB connection or use a test DB
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/segments (GET) should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/segments')
      .expect(200);
  });

  it('/api/system/health (GET) should return 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/system/health')
      .expect(401); // Unauthorized
  });
});

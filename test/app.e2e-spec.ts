import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should list transactions made or received from 0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3 sorted by blockNumber and transactionIndex', async () => {
    return request(app.getHttpServer())
      .get('/transactions?address=0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              blockNumber: expect.any(Number),
              index: expect.any(Number),
              hash: expect.any(String),
              type: expect.any(Number),
              to: expect.any(String),
              from: expect.any(String),
              nonce: expect.any(Number),
              gasLimit: expect.any(String),
              gasPrice: expect.any(String),
              data: expect.any(String),
              value: expect.any(String),
              chainId: expect.any(String),
              blockHash: expect.any(String),
            }),
          ]),
        );
      });
  });

  it('should return number of transactions made or received from 0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3', async () => {
    return request(app.getHttpServer())
      .get(
        '/transactions/count?address=0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3',
      )
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            sent: expect.any(Number),
            received: expect.any(Number),
          }),
        );
      });
  });

  it('should list of transactions sorted by value (amount of $AVAX moved)', async () => {
    return request(app.getHttpServer())
      .get('/transactions/sorted')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              blockNumber: expect.any(Number),
              index: expect.any(Number),
              hash: expect.any(String),
              type: expect.any(Number),
              to: expect.any(String),
              from: expect.any(String),
              nonce: expect.any(Number),
              gasLimit: expect.any(String),
              gasPrice: expect.any(String),
              data: expect.any(String),
              value: expect.any(String),
              chainId: expect.any(String),
              blockHash: expect.any(String),
            }),
          ]),
        );
      });
  });

  it('should list of transactions sorted by value (amount of $AVAX moved) (ASC)', async () => {
    return request(app.getHttpServer())
      .get('/transactions/sorted?order=asc')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              blockNumber: expect.any(Number),
              index: expect.any(Number),
              hash: expect.any(String),
              type: expect.any(Number),
              to: expect.any(String),
              from: expect.any(String),
              nonce: expect.any(Number),
              gasLimit: expect.any(String),
              gasPrice: expect.any(String),
              data: expect.any(String),
              value: expect.any(String),
              chainId: expect.any(String),
              blockHash: expect.any(String),
            }),
          ]),
        );
      });
  });

  it('should list of transactions sorted by value (amount of $AVAX moved) (DESC)', async () => {
    return request(app.getHttpServer())
      .get('/transactions/sorted?order=desc')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              blockNumber: expect.any(Number),
              index: expect.any(Number),
              hash: expect.any(String),
              type: expect.any(Number),
              to: expect.any(String),
              from: expect.any(String),
              nonce: expect.any(Number),
              gasLimit: expect.any(String),
              gasPrice: expect.any(String),
              data: expect.any(String),
              value: expect.any(String),
              chainId: expect.any(String),
              blockHash: expect.any(String),
            }),
          ]),
        );
      });
  });

  it('should list of 100 addresses with largest balance that made or received a transaction', async () => {
    return request(app.getHttpServer())
      .get('/transactions/top')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              address: expect.any(String),
              balance: expect.any(String),
            }),
          ]),
        );
      });
  });
});

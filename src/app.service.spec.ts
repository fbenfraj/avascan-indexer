import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { CacheService } from './cache/cache.service';
import { DbService } from './db/db.service';
import { HttpService } from './http/http.service';
import { generateMockBlocks, generateMockTransactions } from './utils/mocks';
import { WssService } from './wss/wss.service';

describe('AppService', () => {
  let appService: AppService;
  let cacheService: CacheService;
  let httpService: HttpService;
  let dbService: DbService;
  let wssService: WssService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: CacheService,
          useValue: {
            filterUncachedBlocks: jest.fn(),
            cacheBlocks: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            getCurrentBlockNumber: jest.fn(),
            fetchBlockConcurrently: jest.fn(),
            fetchTransactionsConcurrently: jest.fn(),
          },
        },
        {
          provide: DbService,
          useValue: {
            saveBlocks: jest.fn(),
            saveTransactions: jest.fn(),
          },
        },
        {
          provide: WssService,
          useValue: {
            getWebSocket: jest.fn(() => ({
              on: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    cacheService = module.get<CacheService>(CacheService);
    httpService = module.get<HttpService>(HttpService);
    dbService = module.get<DbService>(DbService);
    wssService = module.get<WssService>(WssService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockRestore();
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  describe('processLatestBlocks', () => {
    it('should process latest blocks and save them along with their transactions to the database', async () => {
      const blockNumber = 100;
      const blocks = generateMockBlocks(10);
      const uncachedBlocks = generateMockBlocks(5);
      const transactions = generateMockTransactions(10, Number(blocks[0].hash));

      jest
        .spyOn(httpService, 'getCurrentBlockNumber')
        .mockResolvedValue(blockNumber);
      jest
        .spyOn(httpService, 'fetchBlockConcurrently')
        .mockResolvedValue(blocks);
      jest
        .spyOn(cacheService, 'filterUncachedBlocks')
        .mockResolvedValue(uncachedBlocks);
      jest.spyOn(dbService, 'saveBlocks').mockResolvedValue(undefined);
      jest.spyOn(cacheService, 'cacheBlocks').mockResolvedValue(undefined);
      jest
        .spyOn(httpService, 'fetchTransactionsConcurrently')
        .mockResolvedValue(transactions);
      jest.spyOn(dbService, 'saveTransactions').mockResolvedValue(undefined);

      await appService.processLatestBlocks();

      expect(httpService.getCurrentBlockNumber).toBeCalled();
      expect(httpService.fetchBlockConcurrently).toBeCalledWith(
        blockNumber - 10,
        blockNumber,
      );
      expect(cacheService.filterUncachedBlocks).toBeCalledWith(blocks);
      expect(dbService.saveBlocks).toBeCalledWith(uncachedBlocks);
      expect(cacheService.cacheBlocks).toBeCalledWith(uncachedBlocks);
      expect(httpService.fetchTransactionsConcurrently).toBeCalledWith(
        blocks.map((block) => block.hash),
      );
      expect(dbService.saveTransactions).toBeCalledWith(transactions);
    });
  });
});

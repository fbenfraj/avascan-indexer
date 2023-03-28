import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from './db.service';
import { Block, TransactionResponse } from 'ethers';
import { BlockEntity } from '../entities/BlockEntity';
import {
  AbstractSqlConnection,
  AbstractSqlDriver,
  AbstractSqlPlatform,
  EntityManager,
} from '@mikro-orm/postgresql';
import { generateMockBlocks, generateMockTransactions } from '../utils/mocks';
import { ConfigService } from '@nestjs/config';
import { TransactionEntity } from '../entities/TransactionEntity';

describe('DbService', () => {
  let service: DbService;
  let entityManagerMock: Partial<EntityManager>;

  const transactionalMock = jest.fn(async (callback) => {
    await callback({
      ...entityManagerMock,
      flush: entityManagerMock.flush,
    });
  });

  beforeEach(async () => {
    const queryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      execute: jest
        .fn()
        .mockResolvedValue(Array(10000).fill(new TransactionEntity())),
    };

    entityManagerMock = {
      create: jest.fn(),
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn(),
      fork: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
      transactional: transactionalMock as unknown as EntityManager<
        AbstractSqlDriver<AbstractSqlConnection, AbstractSqlPlatform>
      >['transactional'],
    };

    (entityManagerMock.fork as jest.Mock).mockReturnValue(entityManagerMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbService,
        ConfigService,
        { provide: EntityManager, useValue: entityManagerMock },
      ],
    }).compile();

    service = module.get<DbService>(DbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveBlocks', () => {
    it('should call transactional and persist the given blocks', async () => {
      const mockBlocks: Block[] = generateMockBlocks(3);
      const mockBlockEntities = mockBlocks.map(() => new BlockEntity());

      (entityManagerMock.create as jest.Mock).mockImplementation(
        () => new BlockEntity(),
      );

      await service.saveBlocks(mockBlocks);

      expect(entityManagerMock.transactional).toHaveBeenCalledTimes(1);
      expect(entityManagerMock.persist).toHaveBeenCalledTimes(1);
      expect(entityManagerMock.persist).toHaveBeenCalledWith(mockBlockEntities);
    });
  });

  describe('getTransactionsSortedByValue', () => {
    it('should query a large number of transactions quickly', async () => {
      const numberOfTransactions = 100000;
      const block = generateMockBlocks(1)[0];
      const transactions: TransactionResponse[] = generateMockTransactions(
        numberOfTransactions,
        Number(block.hash),
      );

      await service.saveTransactions(transactions);

      const startTime: number = Date.now();
      const result: TransactionEntity[] =
        await service.getTransactionsSortedByValue('desc', 10000, 0);
      const endTime: number = Date.now();
      const duration: number = endTime - startTime;

      expect(duration).toBeLessThan(1000);
      expect(result.length).toEqual(10000);
    });
  });
});

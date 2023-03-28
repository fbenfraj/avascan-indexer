import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from './db.service';
import { Block } from 'ethers';
import { BlockEntity } from '../entities/BlockEntity';
import {
  AbstractSqlConnection,
  AbstractSqlDriver,
  AbstractSqlPlatform,
  EntityManager,
} from '@mikro-orm/postgresql';
import { generateMockBlocks } from '../utils/mocks';
import { ConfigService } from '@nestjs/config';

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
    entityManagerMock = {
      create: jest.fn(),
      persist: jest.fn().mockReturnThis(),
      flush: jest.fn(),
      fork: jest.fn(),
      createQueryBuilder: jest.fn(),
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
});

import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/common';
import { Block } from 'ethers';
import generateMockBlocks from '../utils/generateMockBlocks';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManagerMock: {
    get: jest.Mock;
    set: jest.Mock;
  };

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filterUncachedBlocks', () => {
    it('should return an array of uncached blocks', async () => {
      const mockBlocks: Block[] = generateMockBlocks(3);

      cacheManagerMock.get.mockResolvedValueOnce(undefined);
      cacheManagerMock.get.mockResolvedValueOnce('mockHash');

      const uncachedBlocks = await service.filterUncachedBlocks(mockBlocks);
      expect(uncachedBlocks.length).toEqual(2);
      expect(uncachedBlocks[0]).toEqual(mockBlocks[0]);
    });
  });

  describe('cacheBlocks', () => {
    it('should call set on the cache manager for each block in the input array', async () => {
      const mockBlocks: Block[] = generateMockBlocks(3);

      await service.cacheBlocks(mockBlocks);

      expect(cacheManagerMock.set).toHaveBeenCalledTimes(mockBlocks.length);
      mockBlocks.forEach((block) => {
        expect(cacheManagerMock.set).toHaveBeenCalledWith(
          block.number.toString(),
          block.hash,
        );
      });
    });
  });
});

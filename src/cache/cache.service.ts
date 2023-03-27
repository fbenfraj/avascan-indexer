import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Block } from 'ethers';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async filterUncachedBlocks(blocks: Block[]): Promise<Block[]> {
    const uncachedBlocks: Block[] = [];
    for (const block of blocks) {
      const cachedBlock = await this.cacheManager.get(block.number.toString());

      if (!cachedBlock) {
        uncachedBlocks.push(block);
      }
    }

    return uncachedBlocks;
  }

  async cacheBlocks(blocks: Block[]): Promise<void> {
    for (const block of blocks) {
      await this.cacheManager.set(block.number.toString(), block.hash);
    }
  }
}

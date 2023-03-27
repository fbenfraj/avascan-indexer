import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Block } from 'ethers';

@Injectable()
export class CacheService {
  logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Filters out cached blocks from the input array of blocks.
   * @param blocks - The array of blocks to be filtered.
   * @returns Promise<Block[]> - A promise that resolves to an array of uncached blocks.
   */
  async filterUncachedBlocks(blocks: Block[]): Promise<Block[]> {
    const uncachedBlocks: Block[] = [];

    for (const block of blocks) {
      try {
        const cachedBlock = await this.cacheManager.get(
          block.number.toString(),
        );

        if (!cachedBlock) {
          uncachedBlocks.push(block);
        }
      } catch (error) {
        this.logger.error(
          `Error checking cache for block number ${block.number}: ${error}`,
        );
        throw error;
      }
    }

    return uncachedBlocks;
  }
  /**
   * Caches the input array of blocks.
   * @param blocks - The array of blocks to be cached.
   * @returns Promise<void> - A promise that resolves when all the blocks are cached.
   */
  async cacheBlocks(blocks: Block[]): Promise<void> {
    for (const block of blocks) {
      try {
        await this.cacheManager.set(block.number.toString(), block.hash);
      } catch (error) {
        this.logger.error(
          `Error caching block number ${block.number}: ${error}`,
        );
        throw error;
      }
    }
  }
}

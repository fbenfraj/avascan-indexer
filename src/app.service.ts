import { Injectable, Logger } from '@nestjs/common';
import { Block } from 'ethers';
import { RawData } from 'ws';
import { CacheService } from './cache/cache.service';
import { DbService } from './db/db.service';
import { HttpService } from './http/http.service';
import { WssService } from './wss/wss.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly httpService: HttpService,
    private readonly dbService: DbService,
    private readonly wssService: WssService,
  ) {
    this.processLatestBlocks();

    const webSocket = this.wssService.getWebSocket();
    webSocket.on('message', async (data: RawData) => {
      const block: WssBlock = await this.wssService.getBlockFromData(data);

      if (block) {
        const ethersBlock: Block =
          this.httpService.wssBlockToEthersBlock(block);

        const uncachedBlocks = await this.cacheService.filterUncachedBlocks([
          ethersBlock,
        ]);

        this.dbService.saveBlocks(uncachedBlocks);

        this.cacheService.cacheBlocks(uncachedBlocks);

        if (uncachedBlocks.length !== 0) {
          const transactions =
            await this.httpService.fetchTransactionsConcurrently([
              ethersBlock.hash,
            ]);

          this.dbService.saveTransactions(transactions);
        }
      }
    });
  }

  /**
   * Processes the latest blocks and saves them along with their transactions to the database.
   * @returns A Promise that resolves to void.
   */
  async processLatestBlocks(): Promise<void> {
    try {
      const latestBlockNumber = await this.httpService.getCurrentBlockNumber();

      const startBlock = latestBlockNumber - 10;
      const endBlock = latestBlockNumber;

      const blocks = await this.httpService.fetchBlockConcurrently(
        startBlock,
        endBlock,
      );

      const uncachedBlocks: Block[] =
        await this.cacheService.filterUncachedBlocks(blocks);

      await this.dbService.saveBlocks(uncachedBlocks);

      this.cacheService.cacheBlocks(uncachedBlocks);

      const blockHashes = blocks.map((block) => block.hash);

      if (uncachedBlocks.length !== 0) {
        const transactions =
          await this.httpService.fetchTransactionsConcurrently(blockHashes);
        await this.dbService.saveTransactions(transactions);
      }
    } catch (error) {
      this.logger.error(`Failed to process latest blocks: ${error}`);
    }
  }
}

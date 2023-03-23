import { Injectable } from '@nestjs/common';
import { Block } from 'ethers';
import { RawData } from 'ws';
import { DbService } from './db/db.service';
import { HttpService } from './http/http.service';
import { WssService } from './wss/wss.service';

@Injectable()
export class AppService {
  constructor(
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

        this.dbService.saveBlocks([ethersBlock]);
      }
    });
  }

  async processLatestBlocks(): Promise<void> {
    const latestBlockNumber = await this.httpService.getCurrentBlockNumber();

    const startBlock = latestBlockNumber - 10;
    const endBlock = latestBlockNumber;

    const blocks = await this.httpService.fetchBlockConcurrently(
      startBlock,
      endBlock,
    );

    this.dbService.saveBlocks(blocks);
  }
}

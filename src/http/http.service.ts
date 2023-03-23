import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Block, ethers } from 'ethers';

@Injectable()
export class HttpService {
  private AVA_RPC_URL = `https://avalanche-mainnet.infura.io/v3`;
  public provider: ethers.JsonRpcProvider;

  constructor(private configService: ConfigService) {
    const INFURA_API_KEY = this.configService.get('INFURA_API_KEY');

    this.provider = new ethers.JsonRpcProvider(
      `${this.AVA_RPC_URL}/${INFURA_API_KEY}`,
    );
  }

  async getCurrentBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBlock(blockNumber: number): Promise<ethers.Block> {
    return await this.provider.getBlock(blockNumber);
  }

  async fetchBlockConcurrently(
    startBlock: number,
    endBlock: number,
  ): Promise<Block[]> {
    const promises: Promise<Block>[] = [];

    for (let i = startBlock; i <= endBlock; i++) {
      promises.push(this.getBlock(i));
    }

    return await Promise.all(promises);
  }
}

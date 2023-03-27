import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Block, BlockParams, ethers } from 'ethers';

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

  async fetchTransactionsConcurrently(
    blockHashes: string[],
  ): Promise<ethers.TransactionResponse[]> {
    const promises: Promise<ethers.TransactionResponse>[] = [];

    for (const blockHash of blockHashes) {
      const block = await this.provider.getBlock(blockHash, true);

      if (block && block.transactions.length > 0) {
        const txPromises = block.transactions
          .map(async (txHash, i) => {
            const tx = await this.provider.getTransaction(txHash);

            if (!tx) {
              return null;
            }

            const txWithIndex = {
              ...tx,
              index: i, // Set the transactionIndex
            } as ethers.TransactionResponse;

            return txWithIndex;
          })
          .filter((tx) => tx !== null);

        promises.push(...txPromises);
      }
    }

    return await Promise.all(promises);
  }

  wssBlockToEthersBlock(wssBlock: WssBlock): Block {
    const blockParams: BlockParams = {
      number: parseInt(wssBlock.number, 16),
      timestamp: parseInt(wssBlock.timestamp, 16),
      nonce: wssBlock.nonce,
      difficulty: BigInt(wssBlock.difficulty),
      gasLimit: BigInt(wssBlock.gasLimit),
      gasUsed: BigInt(wssBlock.gasUsed),
      miner: wssBlock.miner,
      extraData: wssBlock.extraData,
      parentHash: wssBlock.parentHash,
      hash: wssBlock.hash,
      baseFeePerGas: BigInt(wssBlock.baseFeePerGas),
      transactions: [],
    };

    return new Block(blockParams, this.provider);
  }

  async getTop100AddressesWithLargestBalance(
    uniqueAddresses: string[],
  ): Promise<AddressBalance[]> {
    const balancePromises = Array.from(uniqueAddresses).map(async (address) => {
      const balance = await this.provider.getBalance(address);
      return { address, balance: balance.toString() };
    });

    const addressBalances: AddressBalance[] = await Promise.all(
      balancePromises,
    );

    addressBalances.sort((a, b) => {
      return Number(BigInt(b.balance) - BigInt(a.balance));
    });

    return addressBalances.slice(0, 100);
  }
}

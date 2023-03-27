import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Block, BlockParams, ethers } from 'ethers';

@Injectable()
export class HttpService {
  private AVA_RPC_URL = `https://avalanche-mainnet.infura.io/v3`;
  public provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(HttpService.name);

  constructor(private configService: ConfigService) {
    const INFURA_API_KEY = this.configService.get('INFURA_API_KEY');

    this.provider = new ethers.JsonRpcProvider(
      `${this.AVA_RPC_URL}/${INFURA_API_KEY}`,
    );
  }

  /**
   * Get the current block number from the provider.
   * @returns The current block number as a Promise<number>.
   * @throws An error if the provider fails to fetch the block number.
   */
  async getCurrentBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      this.logger.error('Failed to get the current block number', error.stack);
      throw error;
    }
  }

  /**
   * Get the block data for a specific block number from the provider.
   * @param blockNumber - The block number to fetch.
   * @returns The block data as a Promise<ethers.Block>.
   * @throws An error if the provider fails to fetch the block data.
   */
  async getBlock(blockNumber: number): Promise<ethers.Block> {
    try {
      return await this.provider.getBlock(blockNumber);
    } catch (error) {
      this.logger.error(
        `Failed to get block data for block number ${blockNumber}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Fetch blocks concurrently from the provider for a given range of block numbers.
   * @param startBlock - The starting block number.
   * @param endBlock - The ending block number.
   * @returns An array of fetched blocks as a Promise<Block[]>.
   */
  async fetchBlockConcurrently(
    startBlock: number,
    endBlock: number,
  ): Promise<ethers.Block[]> {
    try {
      const promises: Promise<ethers.Block>[] = [];
      for (let i = startBlock; i <= endBlock; i++) {
        promises.push(this.getBlock(i));
      }
      return await Promise.all(promises);
    } catch (error) {
      this.logger.error(
        `Failed to fetch blocks concurrently from ${startBlock} to ${endBlock}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Fetch transactions concurrently from the provider for a given array of block hashes.
   * @param blockHashes - An array of block hashes.
   * @returns An array of fetched transactions as a Promise<ethers.TransactionResponse[]>.
   */
  async fetchTransactionsConcurrently(
    blockHashes: string[],
  ): Promise<ethers.TransactionResponse[]> {
    try {
      const promises: Promise<ethers.TransactionResponse | null>[] = [];

      for (const blockHash of blockHashes) {
        const block = await this.provider.getBlock(blockHash, true);

        if (block && block.transactions.length > 0) {
          const txPromises = block.transactions.map(async (txHash, i) => {
            const tx = await this.provider.getTransaction(txHash);

            if (!tx) {
              return null;
            }

            const txWithIndex = {
              ...tx,
              index: i, // Set the transactionIndex
            } as ethers.TransactionResponse;

            return txWithIndex;
          });

          promises.push(...txPromises);
        }
      }

      const transactions = await Promise.all(promises);
      return transactions.filter((tx) => tx !== null);
    } catch (error) {
      this.logger.error(
        'Failed to fetch transactions concurrently for given block hashes',
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Converts a WebSocket Block to an ethers.js Block
   * @param wssBlock - The WebSocket Block object to be converted
   * @returns - An ethers.js Block object
   */
  wssBlockToEthersBlock(wssBlock: WssBlock): Block {
    try {
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
    } catch (error) {
      this.logger.error(
        'Failed to convert WebSocket Block to ethers.js Block',
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Retrieves the top 100 addresses with the largest balance from the provided unique addresses
   * @param uniqueAddresses - An array of unique addresses
   * @returns - A Promise that resolves to an array of address and balance pairs
   */
  async getTop100AddressesWithLargestBalance(
    uniqueAddresses: string[],
  ): Promise<AddressBalance[]> {
    try {
      const balancePromises = Array.from(uniqueAddresses).map(
        async (address) => {
          const balance = await this.provider.getBalance(address);
          return { address, balance: balance.toString() };
        },
      );

      const addressBalances: AddressBalance[] = await Promise.all(
        balancePromises,
      );

      addressBalances.sort((a, b) => {
        return Number(BigInt(b.balance) - BigInt(a.balance));
      });

      return addressBalances.slice(0, 100);
    } catch (error) {
      this.logger.error(
        'Failed to retrieve top 100 addresses with largest balance',
        error.stack,
      );
      throw error;
    }
  }
}

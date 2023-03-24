import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Block, BlockParams, ethers } from 'ethers';

@Injectable()
export class HttpService {
  private AVA_RPC_URL = `https://avalanche-mainnet.infura.io/v3`;
  public provider: ethers.JsonRpcProvider;
  private readonly COVALENT_API_URL = 'https://api.covalenthq.com/v1';
  private COVALENT_API_KEY: string;

  constructor(private configService: ConfigService) {
    const INFURA_API_KEY = this.configService.get('INFURA_API_KEY');

    this.COVALENT_API_KEY = this.configService.get('COVALENT_API_KEY');
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

  // Fast implementation using Covalent API
  async getTransactionsFromAddress(
    chainName: string,
    address: string,
  ): Promise<CovalentTransaction[]> {
    try {
      const url = `${this.COVALENT_API_URL}/${chainName}/address/${address}/transactions_v2/?key=${this.COVALENT_API_KEY}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        if (data && data.data && data.data.items) {
          return data.data.items;
        } else {
          throw new Error(`Unable to fetch transactions for wallet ${address}`);
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      throw error;
    }
  }

  // Slow implementation that checks all blocks in the blockchain
  // This function is kept for demonstration purposes to show that the functionality
  // can be implemented without relying on a third-party service like Covalent
  async getTransactionsFromAddressSlow(address: string) {
    const currentBlockNumber = await this.provider.getBlockNumber();
    const targetAddress = address.toLowerCase();
    let transactions = [];

    for (let i = currentBlockNumber; i >= 0; i--) {
      const block = await this.provider.getBlock(i, true);
      const matchedTransactions = block.transactions.filter(
        (tx) => tx.toLowerCase() === targetAddress,
      );
      transactions = transactions.concat(matchedTransactions);

      // Optional: break the loop reached a block number where the wallet was created
      // if (block.number <= walletCreationBlockNumber) {
      //   break;
      // }
    }

    return transactions;
  }

  async getTransactionCountFromAddress(network: string, address: string) {
    const transactions: CovalentTransaction[] =
      await this.getTransactionsFromAddress(network, address);

    const sentTransactions = transactions.filter(
      (transaction) =>
        transaction.from_address.toLowerCase() === address.toLowerCase(),
    );
    const receivedTransactions = transactions.filter(
      (transaction) =>
        transaction.to_address.toLowerCase() === address.toLowerCase(),
    );

    return {
      sent: sentTransactions.length,
      received: receivedTransactions.length,
    };
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
}

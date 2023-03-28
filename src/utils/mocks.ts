import { Block, TransactionResponse } from 'ethers';

/**
 * Generate an array of mock `Block` objects.
 *
 * @param count The number of `Block` objects to generate.
 *
 * @returns An array of `Block` objects.
 */
export function generateMockBlocks(count: number): Block[] {
  const blocks: Block[] = [];

  for (let i = 0; i < count; i++) {
    const blockNumber = 1000 + i;

    const mockBlock: any = {
      provider: {},
      number: blockNumber,
      hash: `0xhash${blockNumber}`,
      timestamp: 1620000000 + blockNumber * 10,
      parentHash: `0xparentHash${blockNumber}`,
      nonce: `0xnonce${blockNumber}`,
      difficulty: BigInt(blockNumber * 1000),
      gasLimit: BigInt(blockNumber * 10000),
      gasUsed: BigInt(blockNumber * 5000),
      miner: `0xminer${blockNumber}`,
      extraData: `0xextraData${blockNumber}`,
      baseFeePerGas: BigInt(blockNumber * 20),
      transactions: [],
    };

    blocks.push(new Block(mockBlock, mockBlock.provider));
  }

  return blocks;
}

/**
 * Generate an array of mock `TransactionResponse` objects.
 *
 * @param count The number of `TransactionResponse` objects to generate.
 * @param blockNumber The block number for the transactions.
 *
 * @returns An array of `TransactionResponse` objects.
 */
export function generateMockTransactions(
  count: number,
  blockNumber: number,
): TransactionResponse[] {
  const transactions: TransactionResponse[] = [];

  for (let i = 0; i < count; i++) {
    const mockTransaction: any = {
      provider: {},
      blockNumber: blockNumber,
      blockHash: `0xblockHash${blockNumber}`,
      index: i,
      hash: `0xhash${i}`,
      type: 1,
      to: `0xto${i}`,
      from: `0xfrom${i}`,
      nonce: i,
      gasLimit: BigInt(i * 10000),
      gasPrice: BigInt(i * 100),
      maxPriorityFeePerGas: BigInt(i * 50),
      maxFeePerGas: BigInt(i * 150),
      data: `0xdata${i}`,
      value: BigInt(i * 1000),
      chainId: BigInt(1),
      signature: {
        r: `0xsignatureR${i}`,
        s: `0xsignatureS${i}`,
        recoveryParam: i % 2,
      },
      accessList: [],
    };

    transactions.push(
      new TransactionResponse(mockTransaction, mockTransaction.provider),
    );
  }

  return transactions;
}

import { Block } from 'ethers';

/**
 * Generate an array of mock `Block` objects.
 *
 * @param count The number of `Block` objects to generate.
 *
 * @returns An array of `Block` objects.
 */
export default function generateMockBlocks(count: number): Block[] {
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

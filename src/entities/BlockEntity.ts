import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class BlockEntity {
  @PrimaryKey()
  hash!: string;

  @Property()
  number!: number;

  @Property()
  timestamp!: number;

  @Property()
  parentHash!: string;

  @Property()
  nonce!: string;

  @Property()
  difficulty!: bigint;

  @Property()
  gasLimit!: bigint;

  @Property()
  gasUsed!: bigint;

  @Property()
  miner!: string;

  @Property()
  extraData!: string;

  @Property()
  baseFeePerGas!: bigint;
}

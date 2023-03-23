import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class BlockEntity {
  @PrimaryKey()
  id: number;

  @Property()
  number!: number;

  @Property()
  hash!: string;

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

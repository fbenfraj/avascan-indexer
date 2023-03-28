import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class BlockEntity {
  @PrimaryKey()
  hash!: string;

  @Property({ nullable: true })
  number!: number;

  @Property({ nullable: true })
  timestamp!: number;

  @Property({ nullable: true })
  parentHash!: string;

  @Property({ nullable: true })
  nonce!: string;

  @Property({ nullable: true })
  difficulty!: bigint;

  @Property({ nullable: true })
  gasLimit!: bigint;

  @Property({ nullable: true })
  gasUsed!: bigint;

  @Property({ nullable: true })
  miner!: string;

  @Property({ nullable: true })
  extraData!: string;

  @Property({ nullable: true })
  baseFeePerGas!: bigint;
}

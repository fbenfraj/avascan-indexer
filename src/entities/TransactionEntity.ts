import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'transaction_entity' })
export class TransactionEntity {
  @PrimaryKey()
  id: number;

  @Property({ nullable: true })
  blockNumber: number;

  @Property({ nullable: true })
  index: number;

  @Property({ nullable: true })
  hash: string;

  @Property({ nullable: true })
  type: number;

  @Property({ columnType: 'varchar(42)', nullable: true })
  to: string;

  @Property({ columnType: 'varchar(42)', nullable: true })
  from: string;

  @Property({ nullable: true })
  nonce: number;

  @Property({ columnType: 'numeric', nullable: true })
  gasLimit: bigint;

  @Property({ columnType: 'numeric', nullable: true })
  gasPrice: bigint;

  @Property({ columnType: 'text', nullable: true })
  data: string;

  @Property({ columnType: 'numeric', nullable: true })
  value: bigint;

  @Property({ nullable: true })
  chainId: bigint;

  @Property({ nullable: true })
  blockHash: string;
}

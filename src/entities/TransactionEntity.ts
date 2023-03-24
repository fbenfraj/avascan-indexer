import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'transaction_entity' })
export class TransactionEntity {
  @PrimaryKey()
  id: number;

  @Property()
  blockNumber: number;

  @Property()
  hash: string;

  @Property()
  type: number;

  @Property({ columnType: 'varchar(42)' })
  to: string;

  @Property({ columnType: 'varchar(42)' })
  from: string;

  @Property()
  nonce: number;

  @Property({ columnType: 'numeric' })
  gasLimit: bigint;

  @Property({ columnType: 'numeric' })
  gasPrice: bigint;

  @Property({ columnType: 'text' })
  data: string;

  @Property({ columnType: 'numeric' })
  value: bigint;

  @Property()
  chainId: bigint;

  @Property()
  blockHash: string;
}

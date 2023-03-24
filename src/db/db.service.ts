import {
  AbstractSqlConnection,
  AbstractSqlDriver,
  AbstractSqlPlatform,
  EntityManager,
} from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { Block, TransactionResponse } from 'ethers';
import { TransactionEntity } from 'src/entities/TransactionEntity';
import { BlockEntity } from '../entities/BlockEntity';

@Injectable()
export class DbService {
  private readonly emFork: EntityManager<
    AbstractSqlDriver<AbstractSqlConnection, AbstractSqlPlatform>
  >;
  private readonly logger = new Logger(DbService.name);

  constructor(private readonly em: EntityManager) {
    this.emFork = this.em.fork();
  }

  async saveBlocks(blocks: Block[]): Promise<void> {
    const log =
      blocks.length > 1
        ? `blocks from ${blocks[0].number} to ${
            blocks[blocks.length - 1].number
          }`
        : `block ${blocks[0].number}`;

    try {
      await this.emFork.transactional(async (transactionalEntityManager) => {
        const blockEntities = blocks.map((block) =>
          this.emFork.create(BlockEntity, block),
        );

        await transactionalEntityManager.persist(blockEntities).flush();

        this.logger.log(`Saved ${log}`);
      });
    } catch (error) {
      this.logger.error(
        `Error with saving ${log} to the database. Error: `,
        error,
      );
      throw error;
    }
  }

  async saveTransactions(transactions: TransactionResponse[]): Promise<void> {
    try {
      await this.emFork.transactional(async (transactionalEntityManager) => {
        const transactionEntities = transactions.map((transaction) => {
          return this.emFork.create(TransactionEntity, transaction);
        });

        await transactionalEntityManager.persist(transactionEntities).flush();
        this.logger.log(`Saved ${transactions.length} transactions`);
      });
    } catch (error) {
      this.logger.error(
        `Error with saving transactions to the database. Error: `,
        error,
      );
      throw error;
    }
  }
}

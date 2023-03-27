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
        const transactionEntities = transactions
          .filter((transaction) => transaction !== null)
          .map((transaction: TransactionResponse) =>
            this.emFork.create(TransactionEntity, transaction),
          );

        await transactionalEntityManager.persist(transactionEntities).flush();

        const treatedBlocks = Array.from(
          new Set([
            ...transactions.map((transaction) => {
              return transaction?.blockNumber;
            }),
          ]),
        );

        const log =
          treatedBlocks.length > 1
            ? `blocks ${treatedBlocks[0]} to ${
                treatedBlocks[treatedBlocks.length - 1]
              }`
            : `block ${treatedBlocks}`;

        this.logger.log(`Saved ${transactions.length} transactions for ${log}`);
      });
    } catch (error) {
      this.logger.error(
        `Error with saving transactions to the database. Error: `,
        error,
      );
      throw error;
    }
  }

  async getTransactionsByAddress(
    address: string,
  ): Promise<TransactionEntity[]> {
    const qb = this.emFork.createQueryBuilder(TransactionEntity);
    const query = qb
      .select('*')
      .where({ from: address })
      .orWhere({ to: address });

    const transactions = await query.execute();

    return transactions.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
      }
      return a.index - b.index;
    });
  }

  async getTransactionCountFromAddress(address: string) {
    const transactions = await this.getTransactionsByAddress(address);

    const sentTransactions = transactions.filter(
      (transaction) => transaction.from.toLowerCase() === address.toLowerCase(),
    );
    const receivedTransactions = transactions.filter(
      (transaction) => transaction.to.toLowerCase() === address.toLowerCase(),
    );

    return {
      sent: sentTransactions.length,
      received: receivedTransactions.length,
    };
  }
}

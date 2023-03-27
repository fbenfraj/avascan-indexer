import {
  AbstractSqlConnection,
  AbstractSqlDriver,
  AbstractSqlPlatform,
  EntityManager,
} from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { Block, TransactionResponse } from 'ethers';
import { TransactionEntity } from '../entities/TransactionEntity';
import { BlockEntity } from '../entities/BlockEntity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DbService {
  private readonly emFork: EntityManager<
    AbstractSqlDriver<AbstractSqlConnection, AbstractSqlPlatform>
  >;
  private readonly logger = new Logger(DbService.name);
  private readonly dbLogsOn: number;

  constructor(
    private readonly em: EntityManager,
    private configService: ConfigService,
  ) {
    this.emFork = this.em.fork();
    this.dbLogsOn = Number(this.configService.get<string>('DB_LOGS_ON')) || 1;
  }

  /**
   * Saves an array of blocks to the database.
   *
   * @param blocks - The array of blocks to be saved.
   * @returns Promise<void> - A promise that resolves when the blocks are successfully saved.
   * @throws Error - If an error occurs while saving the blocks.
   */
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
          transactionalEntityManager.create(BlockEntity, block),
        );

        await transactionalEntityManager.persist(blockEntities).flush();

        if (this.dbLogsOn) {
          this.logger.log(`Saved ${log}`);
        }
      });
    } catch (error) {
      this.logger.error(
        `Error with saving ${log} to the database. Error: `,
        error,
      );
      throw error;
    }
  }

  /**
   * Saves an array of transactions to the database.
   *
   * @param transactions - The array of transactions to be saved.
   * @returns Promise<void> - A promise that resolves when the transactions are successfully saved.
   * @throws Error - If an error occurs while saving the transactions.
   */
  async saveTransactions(transactions: TransactionResponse[]): Promise<void> {
    try {
      if (transactions.length === 0) return;

      await this.emFork.transactional(async (transactionalEntityManager) => {
        const transactionEntities = transactions
          .filter((transaction) => transaction !== null)
          .map((transaction: TransactionResponse) =>
            transactionalEntityManager.create(TransactionEntity, transaction),
          );

        await transactionalEntityManager.persist(transactionEntities).flush();

        const treatedBlocks = Array.from(
          new Set(transactions.map((transaction) => transaction?.blockNumber)),
        );

        const log =
          treatedBlocks.length > 1
            ? `blocks ${treatedBlocks[0]} to ${
                treatedBlocks[treatedBlocks.length - 1]
              }`
            : `block ${treatedBlocks}`;

        if (this.dbLogsOn) {
          this.logger.log(
            `Saved ${transactions.length} transactions for ${log}`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Error with saving transactions to the database. Error: `,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves transactions by a specific address.
   *
   * @param address - The address for which to retrieve the transactions.
   * @returns Promise<TransactionEntity[]> - A promise that resolves with the array of transactions related to the given address.
   * @throws Error - If an error occurs while fetching transactions.
   */
  async getTransactionsByAddress(
    address: string,
  ): Promise<TransactionEntity[]> {
    try {
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
    } catch (error) {
      this.logger.error(
        `Error with fetching transactions by address. Error: `,
        error,
      );
      throw error;
    }
  }

  /**
   * Get the count of sent and received transactions for a given address.
   * @param address The address for which to fetch the transaction count.
   * @returns An object containing the count of sent and received transactions.
   */
  async getTransactionCountFromAddress(
    address: string,
  ): Promise<{ sent: number; received: number }> {
    try {
      const transactions = await this.getTransactionsByAddress(address);

      const lowercasedAddress = address.toLowerCase();
      const sentTransactions = transactions.filter(
        (transaction) => transaction.from.toLowerCase() === lowercasedAddress,
      );
      const receivedTransactions = transactions.filter(
        (transaction) => transaction.to.toLowerCase() === lowercasedAddress,
      );

      return {
        sent: sentTransactions.length,
        received: receivedTransactions.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get transaction count for address: ${address}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get transactions sorted by value (amount of $AVAX moved) in ascending or descending order.
   * @param order The order in which to sort the transactions, either 'asc' or 'desc'.
   * @returns A list of sorted transactions.
   */
  async getTransactionsSortedByValue(
    order: 'asc' | 'desc',
  ): Promise<TransactionEntity[]> {
    try {
      const qb = this.emFork.createQueryBuilder(TransactionEntity);
      const query = qb.select('*').orderBy({ value: order || 'desc' });

      const transactions = await query.execute();

      return transactions;
    } catch (error) {
      this.logger.error(
        `Failed to get transactions sorted by value in ${order} order`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all unique addresses (both 'from' and 'to') in the database without fetching all transactions.
   * @returns A list of unique addresses.
   */
  async getAllUniqueAddresses(): Promise<string[]> {
    try {
      const fromAddresses = await this.emFork
        .createQueryBuilder(TransactionEntity)
        .select('DISTINCT "from"')
        .execute();

      const toAddresses = await this.emFork
        .createQueryBuilder(TransactionEntity)
        .select('DISTINCT "to"')
        .execute();

      const allUniqueAddresses = new Set([
        ...fromAddresses.map((a) => a.from),
        ...toAddresses.map((a) => a.to),
      ]);

      return Array.from(allUniqueAddresses);
    } catch (error) {
      this.logger.error('Failed to get all unique addresses', error.stack);
      throw error;
    }
  }
}

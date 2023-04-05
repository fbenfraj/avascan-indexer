import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { DbService } from './db/db.service';
import { CustomExceptionFilter } from './filters/custom-exception.filter';

@Controller('transactions')
@UseFilters(CustomExceptionFilter)
export class AppTransactionsController {
  private readonly logger = new Logger(AppTransactionsController.name);

  constructor(private dbService: DbService) {}

  @Get('address/:address')
  async getTransactions(@Param('address') address: string) {
    if (!address) {
      this.logger.log('No address provided');
      return [];
    }

    this.logger.log(`Fetching transactions for address: ${address}`);
    const transactions = await this.dbService.getTransactionsByAddress(address);
    return transactions;
  }

  @Get('sorted')
  async getTransactionsSortedByValue(
    @Query('order') order: 'asc' | 'desc',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    this.logger.log(
      `Fetching transactions sorted by value in ${order || 'desc'} order`,
    );
    const transactions = await this.dbService.getTransactionsSortedByValue(
      order,
      limit,
      limit * (page - 1),
    );
    return transactions;
  }

  @Get('count')
  async getTransactionCount(@Query('address') address: string) {
    this.logger.log(`Fetching transaction count for address: ${address}`);
    return await this.dbService.getTransactionCountFromAddress(address);
  }
}

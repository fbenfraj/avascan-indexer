import { Controller, Get, Query, Logger, UseFilters } from '@nestjs/common';
import { DbService } from './db/db.service';
import { CustomExceptionFilter } from './filters/custom-exception.filter';
import { HttpService } from './http/http.service';

@Controller('transactions')
@UseFilters(CustomExceptionFilter)
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private httpService: HttpService, private dbService: DbService) {}

  @Get()
  async getTransactions(@Query('address') address: string) {
    if (!address) {
      this.logger.log('No address provided');
      return [];
    }

    this.logger.log(`Fetching transactions for address: ${address}`);
    const transactions = await this.dbService.getTransactionsByAddress(address);
    return transactions;
  }

  @Get('sorted')
  async getTransactionsSortedByValue(@Query('order') order: 'asc' | 'desc') {
    this.logger.log(
      `Fetching transactions sorted by value in ${order || 'desc'} order`,
    );
    const transactions = await this.dbService.getTransactionsSortedByValue(
      order,
    );
    return transactions;
  }

  @Get('top')
  async getTop100AddressesWithLargestBalance() {
    this.logger.log('Fetching top 100 addresses with largest balance');
    const uniqueAddresses = await this.dbService.getAllUniqueAddresses();
    const top100Addresses =
      await this.httpService.getTop100AddressesWithLargestBalance(
        uniqueAddresses,
      );
    return top100Addresses;
  }

  @Get('count')
  async getTransactionCount(@Query('address') address: string) {
    this.logger.log(`Fetching transaction count for address: ${address}`);
    return await this.dbService.getTransactionCountFromAddress(address);
  }
}

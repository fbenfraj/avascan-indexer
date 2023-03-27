import { Controller, Get, Query } from '@nestjs/common';
import { DbService } from './db/db.service';
import { HttpService } from './http/http.service';

@Controller('transactions')
export class AppController {
  constructor(private httpService: HttpService, private dbService: DbService) {}

  @Get()
  async getTransactionsSortedByValue(@Query('order') order: 'asc' | 'desc') {
    const transactions = await this.dbService.getTransactionsSortedByValue(
      order,
    );
    return transactions;
  }

  @Get('top')
  async getTop100AddressesWithLargestBalance() {
    const uniqueAddresses = await this.dbService.getAllUniqueAddresses();
    const top100Addresses =
      await this.httpService.getTop100AddressesWithLargestBalance(
        uniqueAddresses,
      );

    return top100Addresses;
  }

  @Get()
  async getTransactions(@Query('address') address: string) {
    const transactions = await this.dbService.getTransactionsByAddress(address);
    return transactions;
  }

  @Get('count')
  async getTransactionCount(@Query('address') address: string) {
    return await this.dbService.getTransactionCountFromAddress(address);
  }
}

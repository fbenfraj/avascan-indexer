import { Controller, Get, Query } from '@nestjs/common';
import { DbService } from './db/db.service';

@Controller('transactions')
export class AppController {
  constructor(private dbService: DbService) {}

  @Get()
  async getTransactions(@Query('address') address: string) {
    const transactions = await this.dbService.getTransactionsByAddress(address);
    return transactions;
  }

  @Get('count')
  async getTransactionCount(@Query('address') address: string) {
    return await this.dbService.getTransactionCountFromAddress(
      address,
    );
  }
}

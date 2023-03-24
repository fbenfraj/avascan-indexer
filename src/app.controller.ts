import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from './http/http.service';

@Controller('transactions')
export class AppController {
  constructor(private httpService: HttpService) {}

  @Get()
  async getTransactions(@Query('address') address: string) {
    const transactions: CovalentTransaction[] =
      await this.httpService.getTransactionsFromAddress(
        'avalanche-mainnet',
        address,
      );

    return transactions.sort((a, b) => {
      // sort by blockNumber using block_height
      if (a.block_height === b.block_height) {
        // sort by transactionIndex using tx_offset
        return a.tx_offset - b.tx_offset;
      }
      return a.block_height - b.block_height;
    });
  }

  @Get('count')
  async getTransactionCount(@Query('address') address: string) {
    return await this.httpService.getTransactionCountFromAddress(
      'avalanche-mainnet',
      address,
    );
  }
}

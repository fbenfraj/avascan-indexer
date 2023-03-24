import { Controller, Get, Query } from '@nestjs/common';
import { HttpService } from './http/http.service';

@Controller('transactions')
export class AppController {
  constructor(private httpService: HttpService) {}

  @Get()
  async getTransactions(@Query('address') address: string) {
    return await this.httpService.getTransactionsFromAddress(
      'avalanche-mainnet',
      address,
    );
  }
}

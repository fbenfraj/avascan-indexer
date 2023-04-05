import { Controller, Get, Logger, UseFilters } from '@nestjs/common';
import { DbService } from './db/db.service';
import { CustomExceptionFilter } from './filters/custom-exception.filter';
import { HttpService } from './http/http.service';

@Controller('addresses')
@UseFilters(CustomExceptionFilter)
export class AppAddressesController {
  private readonly logger = new Logger(AppAddressesController.name);

  constructor(private httpService: HttpService, private dbService: DbService) {}

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
}

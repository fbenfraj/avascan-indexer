import { Module } from '@nestjs/common';
import { WssService } from './wss.service';

@Module({
  providers: [WssService]
})
export class WssModule {}

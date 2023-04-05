import { Module, CacheModule as RedisModule } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { AppTransactionsController } from './app.transactions.controller';
import { AppAddressesController } from './app.addresses.controller';
import { AppService } from './app.service';
import { WssModule } from './wss/wss.module';
import { HttpModule } from './http/http.module';
import { HttpService } from './http/http.service';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { WssService } from './wss/wss.service';
import type { RedisClientOptions } from 'redis';
import { CacheModule } from './cache/cache.module';
import { CacheService } from './cache/cache.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.register<RedisClientOptions>({
      isGlobal: true,
      // ttl in milliseconds
      ttl: 300000,
      store: redisStore,
    }),
    MikroOrmModule.forRoot({
      type: 'postgresql',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      dbName: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: ['./dist/entities/*.js'],
      entitiesTs: ['./src/entities/*.ts'],
      autoLoadEntities: true,
    }),
    WssModule,
    HttpModule,
    DbModule,
    CacheModule,
  ],
  controllers: [AppAddressesController, AppTransactionsController],
  providers: [AppService, CacheService, HttpService, DbService, WssService],
})
export class AppModule {}

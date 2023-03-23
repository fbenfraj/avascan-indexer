import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WssModule } from './wss/wss.module';
import { HttpModule } from './http/http.module';
import { HttpService } from './http/http.service';
import { DbModule } from './db/db.module';
import { DbService } from './db/db.service';
import { WssService } from './wss/wss.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [AppController],
  providers: [AppService, HttpService, DbService, WssService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TxnsModule } from './txns/txns.module';
import { BuyModule } from './buy/buy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    UsersModule,
    TxnsModule,
    BuyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TxnsController } from './txns.controller';
import { TxnsService } from './txns.service';

@Module({
  controllers: [TxnsController],
  providers: [TxnsService]
})
export class TxnsModule {}

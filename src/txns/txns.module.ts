import { forwardRef, Module } from '@nestjs/common';
import { TxnsController } from './txns.controller';
import { TxnsService } from './txns.service';
import { txnsProviders } from './txns.providers';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [TxnsController],
  providers: [TxnsService, ...txnsProviders],
  imports: [
    forwardRef(() => UsersModule)
  ]
})
export class TxnsModule {}

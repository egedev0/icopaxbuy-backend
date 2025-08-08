import { forwardRef, Module } from '@nestjs/common';
import { BuyController } from './buy.controller';
import { BuyService } from './buy.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [BuyController],
  providers: [BuyService],
  imports: [
    forwardRef(() => UsersModule)
  ]
})
export class BuyModule {}

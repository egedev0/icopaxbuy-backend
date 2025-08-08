import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Txn } from './txns.model';
import { CreateTxnDto } from './txns.dto';
import { UsersService } from 'src/users/users.service';
import { TXNS_TYPE } from 'src/config/txn';

@Injectable()
export class TxnsService {
    constructor(
        @Inject('TXNS_REPOSITORY')
        private txns: typeof Txn,
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService
    ) { }

    async create(data: CreateTxnDto) {
        const user = await this.userService.findUserById(data.usrId);
        await user?.increment({ invested: data.usdValue });
        if (!!data.referrer) {
            const referrer = await this.userService.findUserByAddress(data.referrer);
            if (!!referrer) {
                await this.txns.create({
                    ...data,
                    type: TXNS_TYPE.referral,
                    amount: data.amount * 5 / 100,
                    usdValue: data.amount * 5 / 100,
                    usrId: referrer.id
                })
            }
        }
        return this.txns.create(data);
    }
}

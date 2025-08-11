import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Txn } from './txns.model';
import { CreateTxnDto } from './txns.dto';
import { UsersService } from '../users/users.service';
import { TXNS_TYPE } from '../config/txn';
import { User } from '../users/users.model';

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
                const usdReward = Number((data.usdValue * 0.05).toFixed(2));
                await this.txns.create({
                    ...data,
                    type: TXNS_TYPE.referral,
                    // reward tracked in USD for consistency across tokens
                    amount: usdReward,
                    usdValue: usdReward,
                    usrId: referrer.id,
                    refereeId: data.usrId
                });
            }
        }
        return this.txns.create(data);
    }

    async findBuyTxns(usrId: string): Promise<Txn[]> {
        return this.txns.findAll({
            where: {
                usrId,
                type: TXNS_TYPE.buy,
            },
            order: [['createdAt', 'DESC']], // order from newest to oldest
        });
    }


    async findReferrals(usrId: string): Promise<Txn[]> {
        return this.txns.findAll({
            where: {
                usrId,
                type: TXNS_TYPE.referral
            },
            order: [['createdAt', 'DESC']], // order from newest to oldest
            include: [
                {
                    model: User,
                    as: 'referee'
                }
            ]
        })
    }
}

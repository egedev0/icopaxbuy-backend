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
                const pct = (referrer.customReferralPct ?? 5) / 100;
                await this.txns.create({
                    ...data,
                    type: TXNS_TYPE.referral,
                    amount: data.amount * pct,
                    usdValue: data.usdValue * pct,
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

    async claimReferrals(usrId: string) {
        const unclaimed = await this.txns.findAll({
            where: { usrId, type: TXNS_TYPE.referral, isClaimed: false }
        });
        let total = 0;
        for (const r of unclaimed) {
            total += r.usdValue;
            await r.update({ isClaimed: true, claimedAt: new Date() });
        }
        return { ok: true, claimedCount: unclaimed.length, totalUsd: total };
    }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Txn } from './txns.model';
import { CreateReferralPayoutDto, CreateTxnDto, UpdateReferralPayoutDto } from './txns.dto';
import { UsersService } from '../users/users.service';
import { TXNS_TYPE } from '../config/txn';
import { User } from '../users/users.model';
import { ReferralPayout, REFERRAL_PAYOUT_STATUS } from './referral-payout.model';

@Injectable()
export class TxnsService {
    constructor(
        @Inject('TXNS_REPOSITORY')
        private txns: typeof Txn,
    @Inject('REFERRAL_PAYOUT_REPOSITORY')
    private referralPayouts: typeof ReferralPayout,
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService
    ) { }

    async create(data: CreateTxnDto) {
        const user = await this.userService.findUserById(data.usrId);
        await user?.increment({ invested: data.usdValue });
        // Prefer explicit referrer address from payload; otherwise fall back to stored referredById
        let referrerUser: User | null = null;
        if (data.referrer) {
            referrerUser = await this.userService.findUserByAddress(data.referrer);
        }
        if (!referrerUser && user?.referredById) {
            referrerUser = await this.userService.findUserById(user.referredById);
        }
        if (referrerUser) {
            const usdReward = Number((data.usdValue * 0.05).toFixed(2));
            await this.txns.create({
                ...data,
                type: TXNS_TYPE.referral,
                amount: usdReward,
                usdValue: usdReward,
                usrId: referrerUser.id,
                refereeId: data.usrId
            });
        }
        return this.txns.create(data);
    }

  async requestReferralPayout(data: CreateReferralPayoutDto) {
    // basic guard: ensure user exists
    const user = await this.userService.findUserById(data.usrId);
    if (!user) throw new Error('User not found');
    // TODO: optionally check available referral balance >= amountUsd
    return this.referralPayouts.create({
      usrId: data.usrId,
      toAddress: data.toAddress,
      amountUsd: data.amountUsd,
      status: REFERRAL_PAYOUT_STATUS.pending,
    });
  }

  async listReferralPayouts(usrId: string) {
    return this.referralPayouts.findAll({ where: { usrId }, order: [['createdAt', 'DESC']] });
  }

  async updateReferralPayout(id: string, body: UpdateReferralPayoutDto) {
    const payout = await this.referralPayouts.findByPk(id);
    if (!payout) throw new Error('Payout not found');
    if (body.txHash !== undefined) payout.set('txHash', body.txHash);
    if (body.status !== undefined) payout.set('status', body.status as any);
    await payout.save();
    return payout;
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

    // Optional: claim aggregation endpoint logic (stub returning totals)
    async claimReferrals(usrId: string) {
        const list = await this.findReferrals(usrId);
        const totalUsd = list.reduce((s, t) => s + (Number(t.usdValue) || 0), 0);
        return { count: list.length, totalUsd };
    }
}

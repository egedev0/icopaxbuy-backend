import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TxnsService } from './txns.service';
import { CreateTxnDto } from './txns.dto';

@Controller('txns')
export class TxnsController {
    constructor(
        private readonly txnService: TxnsService
    ){}

    @Post('create')
    async createTxn (@Body() body: CreateTxnDto) {
        const res = await this.txnService.create(body);
        return res;
    }

    @Get('buy/:id')
    async getBuyTxns(@Param('id') id: string) {
        const res = await this.txnService.findBuyTxns(id);
        return res;
    }

    @Get('referral/:id')
    async getReferrals(@Param('id') id: string) {
        const res = await this.txnService.findReferrals(id);
        return res;
    }

    // Claim all unclaimed referral rewards for a user (no admin approval)
    @Put('referral/claim/:id')
    async claimReferrals(@Param('id') id: string) {
        const res = await this.txnService.claimReferrals(id);
        return res;
    }
}

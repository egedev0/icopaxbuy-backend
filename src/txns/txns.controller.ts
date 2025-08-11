import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  // Preview-only aggregation endpoint used by some clients; returns totals
  @Get('referral/:id/claim')
  async claimReferrals(@Param('id') id: string) {
    const res = await this.txnService.claimReferrals(id);
    return res;
  }
}

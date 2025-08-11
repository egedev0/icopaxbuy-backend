import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { TxnsService } from './txns.service';
import { CreateReferralPayoutDto, CreateTxnDto, UpdateReferralPayoutDto } from './txns.dto';

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

  // Referral payout request endpoints
  @Post('referral/:id/payouts')
  async requestReferralPayout(@Param('id') usrId: string, @Body() body: CreateReferralPayoutDto) {
    const res = await this.txnService.requestReferralPayout({
      usrId,
      toAddress: body.toAddress,
      amountUsd: body.amountUsd,
    });
    return res;
  }

  @Get('referral/:id/payouts')
  async listReferralPayouts(@Param('id') usrId: string) {
    const res = await this.txnService.listReferralPayouts(usrId);
    return res;
  }

  // Admin/backoffice could update status and txHash
  @Patch('referral/payouts/:payoutId')
  async updateReferralPayout(@Param('payoutId') payoutId: string, @Body() body: UpdateReferralPayoutDto) {
    const res = await this.txnService.updateReferralPayout(payoutId, body);
    return res;
  }
}

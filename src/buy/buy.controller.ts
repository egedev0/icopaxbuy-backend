import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BuyService } from './buy.service';

@Controller('buy')
export class BuyController {
    constructor(
        private readonly buyService: BuyService
    ){}

    @Post('request/:id')
    async requestBuy(@Param("id") id: string, @Body() {amount, token, isVesting}: { amount: string; token: string; isVesting: boolean}){
        const res = await this.buyService.generateSignature(
            id,
            amount,
            token,
            isVesting
        );
        return res;
    }
}

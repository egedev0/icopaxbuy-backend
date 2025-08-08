import { Body, Controller, Post } from '@nestjs/common';
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
}

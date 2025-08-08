import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ){}
    @Post('signin')
    async signin(@Body() {address, ref}: {address: string; ref: string | null}) {
        const res = await this.userService.findOrCreate(address, ref);
        return res;
    }

    @Get('leaderboard')
    async getLeaderboard() {
        const res = await this.userService.getLeaderboard();
        return res;
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.model';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
    constructor(
        @Inject("USERS_REPOSITORY")
        private users: typeof User
    ) { }

    async findOrCreate(
        address: string,
        referredById: string | null
    ): Promise<User> {
        let user = await this.users.findOne({
            where: {
                address: {
                    [Op.iLike]: address.toLowerCase()
                }
            }
        });
        if (!!user) return user;
        user = await this.users.create({
            address,
            referredById
        });
        return user;
    }
}

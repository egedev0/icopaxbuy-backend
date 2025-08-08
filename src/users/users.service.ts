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

    async findUserById(id: string): Promise<User | null> {
        return this.users.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'referrer'
                }
            ]
        });
    }
    async findUserByAddress(address: string): Promise<User | null> {
        return this.users.findOne({
            where: {
                address: {
                    [Op.iLike]: address.toLowerCase()
                }
            }
        })
    }

    async getLeaderboard(): Promise<User[]> {
        return this.users.findAll({
            limit: 50,
            order: [['invested', 'DESC']],
            where: {
                invested: {
                    [Op.gt]: 0  // invested greater than 0
                }
            }
        })
    }
}

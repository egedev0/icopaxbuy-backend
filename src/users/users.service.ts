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
        // Normalize and resolve ref to a valid user id if possible
        let resolvedRefId: string | null = null;
        if (referredById && referredById.trim().length > 0) {
            const ref = referredById.trim();
            const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidV4Regex.test(ref)) {
                resolvedRefId = ref;
            } else if (ref.startsWith('0x') && ref.length === 42) {
                const refUser = await this.findUserByAddress(ref);
                if (refUser) {
                    resolvedRefId = refUser.id;
                }
            }
        }
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
            referredById: resolvedRefId
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

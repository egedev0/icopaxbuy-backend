import { arrayify } from '@ethersproject/bytes';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ethers, parseEther, ZeroAddress } from 'ethers';
import { signer } from 'src/config/signer';
import { TOKENS_TYPE } from 'src/config/txn';
import { UsersService } from 'src/users/users.service';
import { getBinancePrice } from 'src/utils/binance.utils';

@Injectable()
export class BuyService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService
    ) { }
    async generateSignature(usrId: string, amount: string, token: string) {
        const usr = await this.userService.findUserById(usrId);
        const user = await usr?.get({ plain: true });
        if (!user) throw new NotFoundException("Invalid user");
        const address = user.address;
        const nonce = Math.floor(Date.now() / 1000);
        const referrer = !!user.referrer ? user.referrer.address : ZeroAddress;
        if (token === TOKENS_TYPE.usdt) {
            const hash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "address", "uint256"],
                [address, parseEther(amount), referrer, nonce]
            );
            const messageHashBinary = arrayify(hash);
            const signature = await signer.signMessage(messageHashBinary);
            return {
                nonce,
                signature,
                referrer,
                price: 1
            }
        } else {
            const price = await getBinancePrice("WBNB");
            const hash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "address", "uint256"],
                [address, parseEther(price), referrer, nonce]
            );
            const messageHashBinary = arrayify(hash);
            const signature = await signer.signMessage(messageHashBinary);
            return {
                nonce,
                signature,
                referrer,
                price
            }
        }
    }
}

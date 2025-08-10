import { arrayify } from '@ethersproject/bytes';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ethers, parseEther, ZeroAddress, SigningKey, Signature, Wallet } from 'ethers';
import { signer } from '../config/signer';
import { TOKENS_TYPE } from '../config/txn';
import { UsersService } from '../users/users.service';
import { getBinancePrice } from '../utils/binance.utils';

@Injectable()
export class BuyService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService
    ) { }
    async generateSignature(usrId: string, amount: string, token: string, isVesting: boolean) {
        const usr = await this.userService.findUserById(usrId);
        const user = await usr?.get({ plain: true });
        if (!user) throw new NotFoundException("Invalid user");
        const address = user.address;
        const nonce = Math.floor(Date.now() / 1000);
        const referrer = !!user.referrer ? user.referrer.address : ZeroAddress;
        if (token === TOKENS_TYPE.usdt) {
            // Order: (usdtAmount, isVesting, referrer, nonce, user)
            const hash = ethers.solidityPackedKeccak256(
                ["uint256", "bool", "address", "uint256", "address"],
                [parseEther(amount), isVesting, referrer, nonce, address]
            );
            const messageHashBinary = arrayify(hash);
            // Sign RAW digest (no EIP-191 prefix)
            const signingKey = new SigningKey((signer as Wallet).privateKey);
            const sigObj = signingKey.sign(messageHashBinary);
            const signature = Signature.from(sigObj).serialized;
            return {
                nonce,
                signature,
                referrer,
                price: 1
            }
        } else {
            const price = await getBinancePrice("WBNB");
            // Order: (price, isVesting, referrer, nonce, user)
            const hash = ethers.solidityPackedKeccak256(
                ["uint256", "bool", "address", "uint256", "address"],
                [parseEther(price), isVesting, referrer, nonce, address]
            );
            const messageHashBinary = arrayify(hash);
            // Sign RAW digest (no EIP-191 prefix)
            const signingKey = new SigningKey((signer as Wallet).privateKey);
            const sigObj = signingKey.sign(messageHashBinary);
            const signature = Signature.from(sigObj).serialized;
            
            // Debug log
            console.log('ETH signing (price-based):', {
                address,
                amount,
                amountWei: parseEther(amount).toString(),
                isVesting,
                referrer,
                nonce,
                hash: hash,
                signature
            });
            
            return {
                nonce,
                signature,
                referrer,
                price
            }
        }
    }
}

import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ethers, parseEther, ZeroAddress } from 'ethers';
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
        
        // Log signer address for debugging
        console.log('Backend signer address:', signer.address);
        if (token === TOKENS_TYPE.usdt) {
            // Log parameters for debugging
            console.log('USDT Signing parameters:', {
                address,
                amount: parseEther(amount).toString(),
                isVesting,
                referrer,
                nonce
            });
            
            // abi.encodePacked(buyer, amount, referrer, nonce)
            const hash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "address", "uint256"],
                [address, parseEther(amount), referrer, nonce]
            );
            
            console.log('USDT Hash to sign:', hash);
            
            // EIP-191 prefixed signature
            const signature = await signer.signMessage(ethers.getBytes(hash));
            
            console.log('USDT Generated signature:', signature);
            return {
                nonce,
                signature,
                referrer,
                price: 1
            }
        } else {
            const price = await getBinancePrice("WBNB");
            
            // Log parameters for debugging
            console.log('Signing parameters:', {
                address,
                amount: parseEther(amount).toString(),
                isVesting,
                referrer,
                nonce
            });
            
            // abi.encodePacked(buyer, price, referrer, nonce)
            const hash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "address", "uint256"],
                [address, parseEther(price), referrer, nonce]
            );
            
            console.log('Hash to sign:', hash);
            
            // EIP-191 prefixed signature
            const signature = await signer.signMessage(ethers.getBytes(hash));
            
            console.log('Generated signature:', signature);
            return {
                nonce,
                signature,
                referrer,
                price
            }
        }
    }
}

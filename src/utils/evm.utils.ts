import { Wallet } from "ethers"


export const getSigner = (privatekey: string) => {
    if (!privatekey || privatekey.trim().length === 0) {
        // Development fallback to avoid crashing when PRIVATE_KEY is not set
        const randomWallet = Wallet.createRandom();
        console.error('⚠️ WARNING: No PRIVATE_KEY provided! Using random wallet:', randomWallet.address);
        console.error('⚠️ This will cause "Invalid signature" errors in production!');
        return randomWallet;
    }
    const wallet = new Wallet(privatekey);
    console.log('✅ Signer initialized with address:', wallet.address);
    return wallet;
}
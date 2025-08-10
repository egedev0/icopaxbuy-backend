import { Wallet } from "ethers"


export const getSigner = (privatekey: string) => {
    if (!privatekey || privatekey.trim().length === 0) {
        // Development fallback to avoid crashing when PRIVATE_KEY is not set
        return Wallet.createRandom();
    }
    const wallet = new Wallet(privatekey);
    return wallet;
}
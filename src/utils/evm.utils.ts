import { Wallet } from "ethers"


export const getSigner = (privatekey: string) => {
    const wallet = new Wallet(privatekey);
    return wallet;
}
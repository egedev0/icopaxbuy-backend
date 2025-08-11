

export type CreateTxnDto = {
    usrId: string; 
    token: string; 
    amount: number; 
    usdValue: number; 
    hash: string;
    isVesting: boolean;
    referrer: string | null;
}
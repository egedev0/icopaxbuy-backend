

export type CreateTxnDto = {
    usrId: string; 
    token: string; 
    amount: number; 
    usdValue: number; 
    hash: string;
    isVesting: boolean;
    referrer: string | null;
}

export type CreateReferralPayoutDto = {
  usrId: string;
  toAddress: string;
  amountUsd: number;
};

export type UpdateReferralPayoutDto = {
  txHash?: string;
  status?: 'pending' | 'completed' | 'failed';
};
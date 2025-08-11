import { Txn } from "./txns.model";
import { ReferralPayout } from './referral-payout.model';


export const txnsProviders = [
    {
        provide: 'TXNS_REPOSITORY',
        useValue: Txn
    },
    {
        provide: 'REFERRAL_PAYOUT_REPOSITORY',
        useValue: ReferralPayout
    }
]
import { Txn } from "./txns.model";


export const txnsProviders = [
    {
        provide: 'TXNS_REPOSITORY',
        useValue: Txn
    }
]
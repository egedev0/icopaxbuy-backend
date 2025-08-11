import { Sequelize } from 'sequelize-typescript';
import { Txn } from '../txns/txns.model';
import { ReferralPayout } from '../txns/referral-payout.model';
import { User } from '../users/users.model';


export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';
      const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'false').toLowerCase() === 'true';
      const commonOptions: any = {
        logging: false,
        dialectOptions: useSsl
          ? {
              ssl: {
                require: true,
                rejectUnauthorized
              }
            }
          : {}
      };

      const connectionUrl = process.env.DATABASE_URL;
      const sequelize = connectionUrl
        ? new Sequelize(connectionUrl, { ...commonOptions, dialect: 'postgres' })
        : new Sequelize({
            dialect: 'postgres',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            ...commonOptions
          });
      sequelize.addModels([
        User,
        Txn,
        ReferralPayout,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];  
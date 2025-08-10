import { Sequelize } from 'sequelize-typescript';
import { Txn } from '../txns/txns.model';
import { User } from '../users/users.model';


export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';
      const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'false').toLowerCase() === 'true';
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        logging: false,
        dialectOptions: useSsl
          ? {
              ssl: {
                require: true,
                rejectUnauthorized
              }
            }
          : {}
      });
      sequelize.addModels([
        User,
        Txn
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
import { Sequelize } from 'sequelize-typescript';


export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        logging: false
      });
      sequelize.addModels([
        
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
import { Sequelize } from 'sequelize';
import { env } from './env.js'; // Assuming you have an env.js for environment variables

const sequelize = new Sequelize(env.database, env.databaseUser, env.databasePassword, {
    host: env.databaseHost,
    dialect: 'postgres',
    logging: false, // Disable logging, set to console.log to see raw SQL queries
});

export { sequelize };

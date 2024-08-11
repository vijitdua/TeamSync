import dotenv from "dotenv";

dotenv.config(); // Import configuration from .env

export const env = {
    corsOrigin: process.env.CORS_ORIGIN,
    discordBot: process.env.DISCORD_BOT_TOKEN,
    port: process.env.port || 3000,
    database: process.env.DATABASE,
    databaseHost: process.env.DATABASE_HOST,
    databaseUser: process.env.DATABASE_USER,
    databasePassword: process.env.DATABASE_PASSWORD,
    passportSecret: process.env.PASSPORT_SECRET,
}
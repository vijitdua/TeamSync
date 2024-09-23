import dotenv from "dotenv";
import {fileURLToPath} from "url";
import {dirname, join} from "path";

dotenv.config(); // Import configuration from .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // Get the directory name for the current module
const projectRoot = join(__dirname, '../../'); // Navigate up to the project root

export const env = {
    corsOrigin: process.env.CORS_ORIGIN,
    discordBot: process.env.DISCORD_BOT_TOKEN,
    port: process.env.port || 3000,
    database: process.env.DATABASE,
    databaseHost: process.env.DATABASE_HOST,
    databaseUser: process.env.DATABASE_USER,
    databasePassword: process.env.DATABASE_PASSWORD,
    passportSecret: process.env.PASSPORT_SECRET,
    serverLocation: process.env.SERVER_LOCATION,
    root_location: projectRoot,
}
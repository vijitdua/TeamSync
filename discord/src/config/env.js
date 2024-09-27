import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config(); // Load environment variables from .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // Get directory name of current module
const projectRoot = join(__dirname, '../../'); // Navigate up to the project root

export const env = {
    // Discord config
    discordBotToken: process.env.DISCORD_BOT_TOKEN,
    discordApplicationClientID: process.env.DISCORD_APPLICATION_CLIENT_ID,

    // Discord server config
    discordSecureAccessRoleID: process.env.DISCORD_SECURE_ACCESS_ROLE_ID,

    // Backend Configuration
    backendURL: process.env.BACKEND_URL,

    // Backend Authentication Credentials
    backendUsername: process.env.BACKEND_USERNAME,
    backendPassword: process.env.BACKEND_PASSWORD,

    // Project meta
    rootLocation: projectRoot,
    srcLocation: join(projectRoot, "./src"),
};

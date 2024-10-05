import axios from 'axios';
import { env } from '../config/env.js';
import { sessionCookie } from './auth.js';

/**
 * Fetches the Discord ID of a user by their Discord username using the Discord API.
 *
 * @param {string} discordUsername - The Discord username (without the @).
 * @returns {Promise<string|null>} - The Discord ID of the user if found, otherwise null.
 */
async function getDiscordIdByUsername(discordUsername) {
    try {
        const response = await axios.get(`${env.backendURL}/discord/member/username/${discordUsername}`, {
            headers: {
                Cookie: sessionCookie // Use the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return response.data.data.discordID;  // Return the Discord ID
        } else {
            console.error(`Error fetching Discord ID for ${discordUsername}: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching Discord ID for ${discordUsername}:`, error.message);
        return null;
    }
}

export { getDiscordIdByUsername };

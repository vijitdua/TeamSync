import express from 'express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import { env } from './config/env.js';
import { syncDiscordToBackend, syncBackendToDiscord, syncBothWays } from './services/syncService.js';

// Create a new service file for authorization check
async function isAuthorized(cookies) {
    try {
        const cookieString = Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ');
        const response = await axios.get(`${env.backendURL}/auth/check`, {
            headers: {
                Cookie: cookieString
            }
        });
        return response.status === 200 && response.data.auth === true;
    } catch (error) {
        console.error('Authorization check failed:', error.message);
        return false;
    }
}

// Create a router for the sync endpoint
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true, limit: '10kb' }));
router.use(cookieParser());

// API endpoint for syncing a user
router.post('/sync-user', async (req, res) => {
    const cookies = req.cookies;

    // Check if the user is authorized
    const authorized = await isAuthorized(cookies);
    if (!authorized) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { memberUUID, syncType } = req.body;

    if (!memberUUID || !syncType) {
        return res.status(400).json({ message: 'memberUUID and syncType are required' });
    }

    try {
        let targetDiscordId = null;
        // Fetch the Discord ID using memberUUID
        try {
            const response = await axios.get(`${env.backendURL}/member/${memberUUID}`);
            if (response.status === 200 && response.data.data) {
                targetDiscordId = response.data.data.discordId;
            }
        } catch (error) {
            console.error('Error fetching Discord ID for memberUUID:', error.message);
            return res.status(400).json({ message: 'Invalid memberUUID or member not found' });
        }

        if (!targetDiscordId) {
            return res.status(400).json({ message: 'No Discord ID found for the provided memberUUID' });
        }

        switch (syncType) {
            case 'discord-to-backend':
                await syncDiscordToBackend(targetDiscordId, memberUUID);
                break;
            case 'backend-to-discord':
                await syncBackendToDiscord(targetDiscordId, memberUUID);
                break;
            case 'both':
                await syncBothWays(targetDiscordId, memberUUID);
                break;
            default:
                return res.status(400).json({ message: 'Invalid syncType provided' });
        }

        res.status(200).json({ message: `Synchronization (${syncType}) completed successfully for member UUID: ${memberUUID}` });
    } catch (error) {
        console.error('Error during synchronization:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Export the router for use in server.js
export default router;

// server.js

import express from 'express';
import {
    syncMemberDiscordTeamsByRolesToDatabase,
    syncMemberTeamsByDatabaseToDiscordRoles,
    syncMemberDiscordToBackendAndBackendToDiscord,
} from './services/syncService.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes

/**
 * Synchronize member data from Discord to backend.
 * Expects: { discordMemberId: string, overwrite: boolean, sessionId: string }
 */
app.post('/sync/discord-to-backend', async (req, res) => {
    const { discordMemberId, overwrite = false, sessionId } = req.body;
    if (!discordMemberId || !sessionId) {
        return res
            .status(400)
            .json({ success: false, message: 'discordMemberId and sessionId are required' });
    }
    try {
        await syncMemberDiscordTeamsByRolesToDatabase(discordMemberId, overwrite, sessionId);
        res.json({ success: true, message: 'Synchronization from Discord to backend completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Synchronize member data from backend to Discord.
 * Expects: { discordMemberId: string, overwrite: boolean, sessionId: string }
 */
app.post('/sync/backend-to-discord', async (req, res) => {
    const { discordMemberId, overwrite = true, sessionId } = req.body;
    if (!discordMemberId || !sessionId) {
        return res
            .status(400)
            .json({ success: false, message: 'discordMemberId and sessionId are required' });
    }
    try {
        await syncMemberTeamsByDatabaseToDiscordRoles(discordMemberId, overwrite, sessionId);
        res.json({ success: true, message: 'Synchronization from backend to Discord completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Synchronize member data both ways.
 * Expects: { discordMemberId: string, sessionId: string }
 */
app.post('/sync/both', async (req, res) => {
    const { discordMemberId, sessionId } = req.body;
    if (!discordMemberId || !sessionId) {
        return res
            .status(400)
            .json({ success: false, message: 'discordMemberId and sessionId are required' });
    }
    try {
        await syncMemberDiscordToBackendAndBackendToDiscord(discordMemberId, sessionId);
        res.json({
            success: true,
            message: 'Synchronization between Discord and backend completed',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});

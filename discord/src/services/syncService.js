// services/syncService.js

import axios from 'axios';
import client from '../client.js'; // Importing client to interact with Discord
import {
    getUUIDByDiscordId,
    getDiscordIdByMemberUUID,
    updateMember
} from './memberService.js';
import {
    getTeamPublicData,
    getTeamUUIDByDiscordRoleId
} from './teamService.js';
import { env } from '../config/env.js';
import { sessionCookie } from './auth.js';

/**
 * Syncs Discord roles to the backend.
 * @param {string} discordId - The Discord ID of the member.
 * @param {string} memberUUID - The UUID of the member in the backend.
 * @returns {Promise<void>}
 */
export async function syncDiscordToBackend(discordId, memberUUID) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error('Bot is not part of any guild.');
        }

        const member = await guild.members.fetch(discordId);
        if (!member) {
            throw new Error(`Member with Discord ID ${discordId} not found in Discord.`);
        }

        // Fetch all team roles from the backend
        const teamRoleIds = await getAllTeamRoleIds();
        if (!teamRoleIds.length) {
            console.warn('No team roles found in the backend.');
        }

        // Identify roles that are linked to teams
        const memberTeamRoleIds = member.roles.cache
            .filter(role => teamRoleIds.includes(role.id))
            .map(role => role.id);

        // Map role IDs to team UUIDs
        const memberTeamUUIDs = [];
        for (const roleId of memberTeamRoleIds) {
            const teamUUID = await getTeamUUIDByDiscordRoleId(roleId);
            if (teamUUID) {
                memberTeamUUIDs.push(teamUUID);
            }
        }

        // Update the member's teams in the backend
        await updateMember(memberUUID, { teams: memberTeamUUIDs }, sessionCookie);

        console.log(`Discord to Backend sync completed for member ${discordId} (UUID: ${memberUUID}).`);
    } catch (error) {
        console.error(`Error in syncDiscordToBackend: ${error.message}`);
        throw error;
    }
}

/**
 * Syncs backend teams to Discord roles.
 * @param {string} discordId - The Discord ID of the member.
 * @param {string} memberUUID - The UUID of the member in the backend.
 * @returns {Promise<void>}
 */
export async function syncBackendToDiscord(discordId, memberUUID) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error('Bot is not part of any guild.');
        }

        const member = await guild.members.fetch(discordId);
        if (!member) {
            throw new Error(`Member with Discord ID ${discordId} not found in Discord.`);
        }

        // Fetch member's teams from the backend
        const memberDataResponse = await axios.get(`${env.backendURL}/member/${memberUUID}`, {
            headers: { Cookie: sessionCookie },
        });

        if (memberDataResponse.status !== 200 || !memberDataResponse.data.data) {
            throw new Error('Failed to fetch member data from backend.');
        }

        const memberTeams = memberDataResponse.data.data.teams || [];

        // Map team UUIDs to Discord role IDs
        const targetRoleIds = [];
        for (const teamUUID of memberTeams) {
            const teamDataResponse = await getTeamPublicData(teamUUID);
            if (teamDataResponse.success && teamDataResponse.data.discordId) {
                targetRoleIds.push(teamDataResponse.data.discordId);
            }
        }

        // Fetch all team roles from the backend
        const allTeamRoleIds = await getAllTeamRoleIds();

        // Identify current team roles in Discord
        const currentTeamRoleIds = member.roles.cache
            .filter(role => allTeamRoleIds.includes(role.id))
            .map(role => role.id);

        // Remove roles not in backend teams
        const rolesToRemove = currentTeamRoleIds.filter(roleId => !targetRoleIds.includes(roleId));
        for (const roleId of rolesToRemove) {
            try {
                await member.roles.remove(roleId);
                console.log(`Removed role ${roleId} from member ${discordId}.`);
            } catch (removeError) {
                console.error(`Failed to remove role ${roleId}: ${removeError.message}`);
            }
        }

        // Add roles from backend teams
        const rolesToAdd = targetRoleIds.filter(roleId => !member.roles.cache.has(roleId));
        for (const roleId of rolesToAdd) {
            try {
                await member.roles.add(roleId);
                console.log(`Added role ${roleId} to member ${discordId}.`);
            } catch (addError) {
                console.error(`Failed to add role ${roleId}: ${addError.message}`);
            }
        }

        console.log(`Backend to Discord sync completed for member ${discordId} (UUID: ${memberUUID}).`);
    } catch (error) {
        console.error(`Error in syncBackendToDiscord: ${error.message}`);
        throw error;
    }
}

/**
 * Performs synchronization in both directions.
 * @param {string} discordId - The Discord ID of the member.
 * @param {string} memberUUID - The UUID of the member in the backend.
 * @returns {Promise<void>}
 */
export async function syncBothWays(discordId, memberUUID) {
    try {
        // Sync Discord roles to backend
        await syncDiscordToBackend(discordId, memberUUID);

        // Sync backend teams to Discord roles
        await syncBackendToDiscord(discordId, memberUUID);

        console.log(`Both-way sync completed for member ${discordId} (UUID: ${memberUUID}).`);
    } catch (error) {
        console.error(`Error in syncBothWays: ${error.message}`);
        throw error;
    }
}

/**
 * Fetches all team role IDs from the backend.
 * @returns {Promise<Array<string>>}
 */
async function getAllTeamRoleIds() {
    try {
        const response = await axios.get(`${env.backendURL}/team/roles`, {
            headers: { Cookie: sessionCookie },
        });

        if (response.status === 200 && response.data.data) {
            return response.data.data
                .filter(team => team.discordId) // Ensure discordId exists
                .map(team => team.discordId);
        } else {
            console.error(`Failed to retrieve team roles: ${response.data.message}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching team role IDs: ${error.message}`);
        return [];
    }
}

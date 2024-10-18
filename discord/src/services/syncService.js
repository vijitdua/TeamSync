import client from '../client.js';
import {
    getMemberDataPrivate,
    getUUIDByDiscordId,
    updateMember,
} from './memberService.js';
import {
    getTeamPublicData,
    getTeamUUIDByDiscordRoleId,
} from './teamService.js';

/**
 * Adds a Discord role to a member.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @param {string} discordRoleId - The Discord ID of the role to add.
 * @returns {Promise<void>}
 */
export async function addRoleToMember(discordMemberId, discordRoleId) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error('No guild found.');
        }
        const member = await guild.members.fetch(discordMemberId);
        if (!member) {
            throw new Error(`Member with ID ${discordMemberId} not found.`);
        }
        await member.roles.add(discordRoleId);
        console.log(`Added role ${discordRoleId} to member ${discordMemberId}.`);
    } catch (error) {
        console.error(`Error adding role to member: ${error.message}`);
    }
}

/**
 * Removes a Discord role from a member.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @param {string} discordRoleId - The Discord ID of the role to remove.
 * @returns {Promise<void>}
 */
export async function removeRoleFromMember(discordMemberId, discordRoleId) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error('No guild found.');
        }
        const member = await guild.members.fetch(discordMemberId);
        if (!member) {
            throw new Error(`Member with ID ${discordMemberId} not found.`);
        }
        await member.roles.remove(discordRoleId);
        console.log(`Removed role ${discordRoleId} from member ${discordMemberId}.`);
    } catch (error) {
        console.error(`Error removing role from member: ${error.message}`);
    }
}

/**
 * Gets a member's Discord roles based on the teams they belong to in the backend.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Array<{ teamUUID: string, teamDiscordId: string }>>}
 */
export async function getMemberDiscordRolesByBackendTeams(
    discordMemberId,
    sessionId
) {
    try {
        // Get the member's UUID from the backend using their Discord ID
        const memberUUID = await getUUIDByDiscordId(discordMemberId);
        if (!memberUUID) {
            throw new Error(`No member found in backend with Discord ID ${discordMemberId}`);
        }

        // Get member data from backend
        const memberDataResponse = await getMemberDataPrivate(memberUUID, sessionId);
        if (!memberDataResponse.success) {
            throw new Error(
                `Failed to get member data for UUID ${memberUUID}: ${memberDataResponse.message}`
            );
        }
        const memberData = memberDataResponse.data;

        // Get the teams the member belongs to
        const teamsUUIDs = memberData.teams || []; // array of team UUIDs

        const result = [];

        // For each team, get the team's public data to get the discordId
        for (const teamUUID of teamsUUIDs) {
            const teamDataResponse = await getTeamPublicData(teamUUID);
            if (teamDataResponse.success) {
                const teamData = teamDataResponse.data;
                if (teamData.discordId) {
                    result.push({
                        teamUUID: teamUUID,
                        teamDiscordId: teamData.discordId,
                    });
                }
            } else {
                console.error(
                    `Failed to get team data for team UUID ${teamUUID}: ${teamDataResponse.message}`
                );
            }
        }

        return result;
    } catch (error) {
        console.error(`Error in getMemberDiscordRolesByBackendTeams: ${error.message}`);
        return [];
    }
}

/**
 * Gets a member's backend teams based on the Discord roles they have.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @returns {Promise<Array<{ discordRoleId: string, teamUUID: string }>>}
 */
export async function getMemberBackendTeamsByDiscordRoles(discordMemberId) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error('No guild found.');
        }

        const member = await guild.members.fetch(discordMemberId);
        if (!member) {
            throw new Error(`Member with ID ${discordMemberId} not found.`);
        }

        const memberRoleIds = member.roles.cache.map((role) => role.id);

        const result = [];

        // For each role ID, check if there is a team in the backend associated with it
        for (const discordRoleId of memberRoleIds) {
            const teamUUID = await getTeamUUIDByDiscordRoleId(discordRoleId);
            if (teamUUID) {
                result.push({
                    discordRoleId: discordRoleId,
                    teamUUID: teamUUID,
                });
            }
        }

        return result;
    } catch (error) {
        console.error(`Error in getMemberBackendTeamsByDiscordRoles: ${error.message}`);
        return [];
    }
}

/**
 * Syncs a member's teams in the backend based on their Discord roles.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @param {boolean} overwrite - Whether to overwrite the member's teams in the backend.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<void>}
 */
export async function syncMemberDiscordTeamsByRolesToDatabase(
    discordMemberId,
    overwrite = false,
    sessionId
) {
    try {
        // Get member's backend teams based on their Discord roles
        const memberTeamsByRoles = await getMemberBackendTeamsByDiscordRoles(discordMemberId);
        const teamUUIDsFromRoles = memberTeamsByRoles.map((item) => item.teamUUID);

        // Get the member's UUID from the backend using their Discord ID
        const memberUUID = await getUUIDByDiscordId(discordMemberId);
        if (!memberUUID) {
            throw new Error(`No member found in backend with Discord ID ${discordMemberId}`);
        }

        // Get member's current teams from backend
        const memberDataResponse = await getMemberDataPrivate(memberUUID, sessionId);
        if (!memberDataResponse.success) {
            throw new Error(
                `Failed to get member data for UUID ${memberUUID}: ${memberDataResponse.message}`
            );
        }
        const memberData = memberDataResponse.data;
        const currentTeamUUIDs = memberData.teams || [];

        let newTeamUUIDs;
        if (overwrite) {
            newTeamUUIDs = teamUUIDsFromRoles;
        } else {
            // Combine the existing teams with the new ones
            const teamUUIDSet = new Set([...currentTeamUUIDs, ...teamUUIDsFromRoles]);
            newTeamUUIDs = Array.from(teamUUIDSet);
        }

        // Update the member's teams in the backend
        const updateResponse = await updateMember(
            memberUUID,
            { teams: newTeamUUIDs },
            sessionId
        );
        if (!updateResponse.success) {
            throw new Error(`Failed to update member teams: ${updateResponse.message}`);
        }

        console.log(`Member ${memberUUID} teams updated successfully in backend.`);
    } catch (error) {
        console.error(`Error in syncMemberDiscordTeamsByRolesToDatabase: ${error.message}`);
    }
}

/**
 * Syncs a member's Discord roles based on their teams in the backend.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @param {boolean} overwrite - Whether to remove roles not present in the backend.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<void>}
 */
export async function syncMemberTeamsByDatabaseToDiscordRoles(
    discordMemberId,
    overwrite = true,
    sessionId
) {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            throw new Error('No guild found.');
        }

        const member = await guild.members.fetch(discordMemberId);
        if (!member) {
            throw new Error(`Member with ID ${discordMemberId} not found.`);
        }

        // Get member's Discord roles based on their backend teams
        const memberDiscordRolesByTeams = await getMemberDiscordRolesByBackendTeams(
            discordMemberId,
            sessionId
        );
        const roleIdsFromTeams = memberDiscordRolesByTeams.map((item) => item.teamDiscordId);

        const currentRoleIds = member.roles.cache.map((role) => role.id);

        if (overwrite) {
            // Remove roles that are not in roleIdsFromTeams
            const rolesToRemove = currentRoleIds.filter(
                (roleId) => !roleIdsFromTeams.includes(roleId)
            );
            for (const roleId of rolesToRemove) {
                await member.roles.remove(roleId);
            }
            // Add roles that are in roleIdsFromTeams but not in currentRoleIds
            const rolesToAdd = roleIdsFromTeams.filter(
                (roleId) => !currentRoleIds.includes(roleId)
            );
            for (const roleId of rolesToAdd) {
                await member.roles.add(roleId);
            }
        } else {
            // Just add roles from backend teams
            const rolesToAdd = roleIdsFromTeams.filter(
                (roleId) => !currentRoleIds.includes(roleId)
            );
            for (const roleId of rolesToAdd) {
                await member.roles.add(roleId);
            }
        }

        console.log(`Member ${discordMemberId} roles updated successfully in Discord.`);
    } catch (error) {
        console.error(`Error in syncMemberTeamsByDatabaseToDiscordRoles: ${error.message}`);
    }
}

/**
 * Syncs a member's teams between Discord and backend in both directions.
 * @param {string} discordMemberId - The Discord ID of the member.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<void>}
 */
export async function syncMemberDiscordToBackendAndBackendToDiscord(
    discordMemberId,
    sessionId
) {
    try {
        // Sync Discord roles to backend teams
        await syncMemberDiscordTeamsByRolesToDatabase(discordMemberId, false, sessionId);

        // Sync backend teams to Discord roles
        await syncMemberTeamsByDatabaseToDiscordRoles(discordMemberId, false, sessionId);

        console.log(`Member ${discordMemberId} synchronization completed.`);
    } catch (error) {
        console.error(
            `Error in syncMemberDiscordToBackendAndBackendToDiscord: ${error.message}`
        );
    }
}

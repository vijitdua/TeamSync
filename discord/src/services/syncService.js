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
        throw error; // Rethrow the error
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
        throw error; // Rethrow the error
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
        throw error; // Rethrow the error
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

        // Refresh role cache
        await guild.roles.fetch();

        // Get member's Discord roles based on their backend teams
        const memberDiscordRolesByTeams = await getMemberDiscordRolesByBackendTeams(
            discordMemberId,
            sessionId
        );
        const roleIdsFromTeams = memberDiscordRolesByTeams.map((item) => item.teamDiscordId);

        const currentRoleIds = member.roles.cache.map((role) => role.id);

        console.log(`Current Roles of Member ${discordMemberId}:`, currentRoleIds);
        console.log(`Roles from Backend for Member ${discordMemberId}:`, roleIdsFromTeams);

        // Get the bot's highest role position
        const botRolePosition = guild.members.me.roles.highest.position;

        // Validate roles from backend
        const validRoleIdsFromTeams = roleIdsFromTeams.filter((roleId) => {
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                console.warn(`Role with ID ${roleId} does not exist in the guild. Skipping.`);
                return false;
            }
            if (role.position >= botRolePosition) {
                console.warn(
                    `Cannot manage role ${role.name} (ID: ${roleId}) due to role hierarchy. Skipping.`
                );
                return false;
            }
            return true;
        });

        if (overwrite) {
            // Remove roles not in validRoleIdsFromTeams
            const rolesToRemove = currentRoleIds.filter(
                (roleId) => !validRoleIdsFromTeams.includes(roleId)
            );
            for (const roleId of rolesToRemove) {
                try {
                    const role = guild.roles.cache.get(roleId);
                    if (!role || role.position >= botRolePosition) continue;
                    await member.roles.remove(roleId);
                    console.log(`Removed role ${roleId} from member ${discordMemberId}.`);
                } catch (error) {
                    console.error(`Failed to remove role ${roleId}: ${error.message}`);
                }
            }
            // Add roles that are in validRoleIdsFromTeams but not in currentRoleIds
            const rolesToAdd = validRoleIdsFromTeams.filter(
                (roleId) => !currentRoleIds.includes(roleId)
            );
            for (const roleId of rolesToAdd) {
                try {
                    await member.roles.add(roleId);
                    console.log(`Added role ${roleId} to member ${discordMemberId}.`);
                } catch (error) {
                    console.error(`Failed to add role ${roleId}: ${error.message}`);
                }
            }
        } else {
            // Just add roles from backend teams
            const rolesToAdd = validRoleIdsFromTeams.filter(
                (roleId) => !currentRoleIds.includes(roleId)
            );
            for (const roleId of rolesToAdd) {
                try {
                    await member.roles.add(roleId);
                    console.log(`Added role ${roleId} to member ${discordMemberId}.`);
                } catch (error) {
                    console.error(`Failed to add role ${roleId}: ${error.message}`);
                }
            }
        }

        console.log(`Member ${discordMemberId} roles updated successfully in Discord.`);
    } catch (error) {
        console.error(`Error in syncMemberTeamsByDatabaseToDiscordRoles: ${error.message}`);
        throw error; // Rethrow the error
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
        throw error; // Rethrow the error
    }
}

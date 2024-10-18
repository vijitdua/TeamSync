// services/teamService.js

import axios from 'axios';
import { env } from '../config/env.js';
import { sessionCookie } from './auth.js';



/**
 * Sends a POST request to the backend to create a new team.
 *
 * @param {Object} teamData - The data required to create the team.
 * @param {string} teamData.name - The name of the team.
 * @param {Array<string>} teamData.teamLead - Array of lead UUIDs.
 * @param {string} teamData.foundationDate - The foundation date of the team (ISO format).
 * @param {string} teamData.teamLogo - The URL to the team's logo.
 * @param {string} teamData.description - A brief description of the team.
 * @param {string|null} teamData.discordId - The Discord role ID associated with the team, if any.
 * @param {Object} teamData.customDataPublic - Public custom data associated with the team.
 * @param {Object} teamData.customDataPrivate - Private custom data associated with the team.
 * @returns {Promise<Object>} - Returns an object containing the success state and a message.
 *    - {boolean} success - True if the team creation was successful, false otherwise.
 *    - {string} message - The success or error message.
 */
export async function createTeam(teamData) {
    try {
        const response = await axios.post(`${env.backendURL}/team`, teamData, {
            headers: {
                Cookie: sessionCookie // Pass the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Team ${teamData.name} created successfully.`
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to create team.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while creating the team.'
        };
    }
}

/**
 * Sends a PUT request to the backend to update an existing team.
 *
 * @param {string} teamId - The UUID of the team to be updated.
 * @param {Object} teamData - The data to update in the team. At least one field is required.
 * @param {string} [teamData.name] - Optional. The updated name of the team.
 * @param {Array<string>} [teamData.teamLead] - Optional. Array of updated lead UUIDs.
 * @param {string} [teamData.foundationDate] - Optional. The updated foundation date (ISO format).
 * @param {string} [teamData.teamLogo] - Optional. The updated URL to the team's logo.
 * @param {string} [teamData.description] - Optional. The updated description of the team.
 * @param {string|null} [teamData.discordId] - Optional. The updated Discord role ID associated with the team.
 * @param {Object} [teamData.customDataPublic] - Optional. Updated public custom data associated with the team.
 * @param {Object} [teamData.customDataPrivate] - Optional. Updated private custom data associated with the team.
 * @returns {Promise<Object>} - Returns an object containing the success state and a message.
 *    - {boolean} success - True if the team update was successful, false otherwise.
 *    - {string} message - The success or error message.
 */
export async function updateTeam(teamId, teamData) {
    try {
        // Ensure teamData contains at least one field to update
        if (!Object.keys(teamData).length) {
            return {
                success: false,
                message: 'No fields provided for update.'
            };
        }

        const response = await axios.put(`${env.backendURL}/team/${teamId}`, teamData, {
            headers: {
                Cookie: sessionCookie
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Team ${teamId} updated successfully.`,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to update team.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while updating the team.'
        };
    }
}

/**
 * Sends a DELETE request to the backend to soft delete a team.
 *
 * @param {string} teamUUID - The UUID of the team to be deleted.
 * @returns {Promise<Object>} - Returns an object containing the success state and a message.
 *    - {boolean} success - True if the team deletion was successful, false otherwise.
 *    - {string} message - The success or error message.
 *    - {Object} [data] - Optional. Contains the deleted team data (ID and deletion date) on success.
 */
export async function deleteTeam(teamUUID) {
    try {
        const response = await axios.delete(`${env.backendURL}/team/${teamUUID}`, {
            headers: {
                Cookie: sessionCookie // Pass the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Team ${teamUUID} deleted successfully.`,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to delete team.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while deleting the team.'
        };
    }
}

/**
 * Fetches the team UUID from the backend using the Discord role ID.
 *
 * @param {string} discordRoleId - The Discord ID of the role (team).
 * @returns {Promise<string|null>} - The UUID of the team if found, otherwise null.
 */
export async function getTeamUUIDByDiscordRoleId(discordRoleId) {
    try {
        const response = await axios.get(`${env.backendURL}/team/discord/${discordRoleId}`, {
            headers: {
                Cookie: sessionCookie  // Include session for authentication
            }
        });

        if (response.status === 200) {
            return response.data.data.id;  // Return the team UUID
        } else {
            console.error(`Failed to get team UUID for role ID ${discordRoleId}: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching team UUID for role ID ${discordRoleId}:`, error.message);
        return null;
    }
}

/**
 * Sends a GET request to retrieve public data of a team by UUID.
 *
 * @param {string} teamUUID - The UUID of the team to retrieve.
 * @returns {Promise<Object>} - Returns an object containing the success state and the team's public data.
 *    - {boolean} success - True if the request was successful, false otherwise.
 *    - {Object} [data] - Contains the public team data on success.
 *    - {string} [message] - Error message in case of failure.
 */
export async function getTeamPublicData(teamUUID) {
    try {
        const response = await axios.get(`${env.backendURL}/team/${teamUUID}`);

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to fetch public team data.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching public team data.'
        };
    }
}

/**
 * Sends a GET request to retrieve private data of a team by UUID.
 *
 * @param {string} teamUUID - The UUID of the team to retrieve.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the team's private data.
 */
export async function getTeamPrivateData(teamUUID, sessionId) {
    try {
        const cookieHeader = sessionId ? `sessionId=${sessionId}` : sessionCookie;
        const response = await axios.get(`${env.backendURL}/team/${teamUUID}`, {
            headers: {
                Cookie: cookieHeader,
            },
        });

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to fetch private team data.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching private team data.',
        };
    }
}

/**
 * Sends a GET request to retrieve a list of all team UUIDs, including deleted ones.
 *
 * @returns {Promise<Object>} - Returns an object containing the success state and the list of team UUIDs.
 */
export async function getTeamUUIDList() {
    try {
        const response = await axios.get(`${env.backendURL}/team`, {
            headers: {
                Cookie: sessionCookie, // Use the session cookie from auth.js
            },
        });

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to fetch team UUID list.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching the team UUID list.',
        };
    }
}

/**
 * Combines data from existing functions to return a specific subset of team data.
 *
 * @returns {Promise<Object>} - Returns an object containing the success state and the list of team data.
 *    - {boolean} success - True if the request was successful, false otherwise.
 *    - {Array<Object>} [data] - Contains an array of objects with the team details (teamUUID, teamName, teamDiscordRoleId, teamLeadUUIDs, and description) on success.
 *    - {string} [message] - Error message in case of failure.
 */
export async function getAllTeamDataList() {
    try {
        const teamsResponse = await getTeamUUIDList();

        if (teamsResponse.success) {
            const teamDataList = await Promise.all(
                teamsResponse.data.map(async (teamUUID) => {
                    const teamDataResponse = await getTeamPublicData(teamUUID);

                    if (teamDataResponse.success) {
                        const teamData = teamDataResponse.data;

                        return {
                            teamUUID: teamData.id,
                            teamName: teamData.name,
                            teamDiscordRoleId: teamData.discordId,
                            teamLeadUUIDs: teamData.teamLead,
                            description: teamData.description,
                        };
                    }
                    return null; // Return null if fetching this team's data fails
                })
            );

            // Filter out any null results from failed requests
            const validTeamData = teamDataList.filter((team) => team !== null);

            // Sort by team name (case-insensitive)
            validTeamData.sort((a, b) =>
                a.teamName.toLowerCase().localeCompare(b.teamName.toLowerCase())
            );

            return {
                success: true,
                data: validTeamData,
            };
        } else {
            return {
                success: false,
                message: teamsResponse.message || 'Failed to fetch team UUID list.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching the team data list.',
        };
    }
}

// services/memberService.js

import axios from 'axios';
import { env } from '../config/env.js';
import { sessionCookie } from './auth.js';


/**
 * Fetches the Discord ID of a member by their UUID using the backend API.
 *
 * @param {string} memberUUID - The UUID of the member.
 * @returns {Promise<string|null>} - The Discord ID of the member if found, otherwise null.
 */
export async function getDiscordIdByMemberUUID(memberUUID) {
    try {
        const response = await axios.get(`${env.backendURL}/member/${memberUUID}`);

        if (response.status === 200 && response.data && response.data.data) {
            return response.data.data.discordId || null; // Return the Discord ID
        } else {
            console.error(`Failed to get Discord ID for member UUID ${memberUUID}: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching member data for UUID ${memberUUID}:`, error.message);
        return null;
    }
}

/**
 * Sends a POST request to the backend to create a new member.
 *
 * @param {Object} memberData - The data required to create the member.
 * @param {string} memberData.name - The name of the member.
 * @param {string} memberData.position - The member's position in the organization.
 * @param {string} memberData.joinDate - The date the member joined (ISO format).
 * @param {string} memberData.profilePicture - The URL to the member's profile picture.
 * @param {string} memberData.phoneNumber - The member's phone number.
 * @param {string} memberData.email - The member's email address.
 * @param {string} memberData.discordId - The member's Discord ID.
 * @param {Array<string>} memberData.teams - Array of team UUIDs the member belongs to.
 * @param {string} memberData.notes - Admin notes for the member.
 * @param {Object} memberData.customDataPublic - Public custom data for the member.
 * @param {Object} memberData.customDataPrivate - Private custom data for the member.
 * @returns {Promise<Object>} - Returns an object containing the success state and a message.
 *    - {boolean} success - True if the member creation was successful, false otherwise.
 *    - {string} message - The success or error message.
 */
export async function createMember(memberData) {
    try {
        const response = await axios.post(`${env.backendURL}/member`, memberData, {
            headers: {
                Cookie: sessionCookie // Pass the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Member ${memberData.name} created successfully.`
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to create member.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while creating the member.'
        };
    }
}

/**
 * Fetches the UUID of a user by their Discord ID using the backend API.
 *
 * @param {string} discordId - The Discord ID of the user.
 * @returns {Promise<string|null>} - The UUID of the user if found, otherwise null.
 */
export async function getUUIDByDiscordId(discordId) {
    try {
        const response = await axios.get(`${env.backendURL}/member/discord/${discordId}`, {
            headers: {
                Cookie: sessionCookie, // Use the session cookie from auth.js
            },
        });

        if (response.status === 200) {
            return response.data.data.id; // Return the UUID
        } else {
            console.error(`Error fetching UUID for Discord ID ${discordId}: ${response.data.message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching UUID for Discord ID ${discordId}:`, error.message);
        return null;
    }
}

/**
 * Sends a GET request to retrieve private data of a specific member by UUID.
 *
 * @param {string} memberUUID - The UUID of the member to retrieve.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the member's private data.
 */
export async function getMemberDataPrivate(memberUUID, sessionId) {
    try {
        const cookieHeader = sessionId ? `sessionId=${sessionId}` : sessionCookie;
        const response = await axios.get(`${env.backendURL}/member/${memberUUID}`, {
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
                message: response.data.message || 'Failed to fetch private member data.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching private member data.',
        };
    }
}

/**
 * Sends a PUT request to the backend to update an existing member.
 *
 * @param {string} memberID - The UUID of the member to be updated.
 * @param {Object} memberData - The data to update in the member profile. At least one field is required.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the updated member data.
 */
export async function updateMember(memberID, memberData, sessionId) {
    try {
        // Ensure that at least one field to update is present
        if (!Object.keys(memberData).length) {
            return {
                success: false,
                message: 'No fields provided for update.',
            };
        }

        const cookieHeader = sessionId ? `sessionId=${sessionId}` : sessionCookie;
        const response = await axios.put(`${env.backendURL}/member/${memberID}`, memberData, {
            headers: {
                Cookie: cookieHeader,
            },
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Member ${memberID} updated successfully.`,
                data: response.data.data,
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to update member.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while updating the member.',
        };
    }
}

/**
 * Sends a DELETE request to the backend to soft delete a member.
 *
 * @param {string} memberID - The UUID of the member to be deleted.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the deleted member's data.
 */
export async function deleteMember(memberID, sessionId) {
    try {
        const cookieHeader = sessionId ? `sessionId=${sessionId}` : sessionCookie;
        const response = await axios.delete(`${env.backendURL}/member/${memberID}`, {
            headers: {
                Cookie: cookieHeader,
            },
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Member ${memberID} deleted successfully.`,
                data: response.data.data,
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to delete member.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while deleting the member.',
        };
    }
}

/**
 * Sends a GET request to retrieve a list of all member UUIDs.
 *
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the list of member UUIDs.
 */
export async function getMemberUUIDList(sessionId) {
    try {
        const cookieHeader = sessionId ? `sessionId=${sessionId}` : sessionCookie;
        const response = await axios.get(`${env.backendURL}/member`, {
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
                message: response.data.error || 'Failed to fetch member UUID list.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching the member UUID list.',
        };
    }
}

/**
 * Sends a GET request to retrieve public data of a specific member by UUID.
 *
 * @param {string} memberUUID - The UUID of the member to retrieve.
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the member's public data.
 */
export async function getMemberDataPublic(memberUUID, sessionId) {
    try {
        const response = await axios.get(`${env.backendURL}/member/${memberUUID}`);

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data,
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to fetch public member data.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching public member data.',
        };
    }
}

/**
 * Combines data from existing functions to return a specific subset of member data.
 *
 * @param {string} [sessionId] - Optional. The session ID for authentication.
 * @returns {Promise<Object>} - Returns an object containing the success state and the list of member data.
 */
export async function getAllMemberDataList(sessionId) {
    try {
        // Fetch the list of all member UUIDs
        const membersResponse = await getMemberUUIDList(sessionId);

        if (membersResponse.success) {
            const memberDataList = await Promise.all(
                membersResponse.data.map(async (memberUUID) => {
                    // Fetch public data for each member
                    const memberDataResponse = await getMemberDataPublic(memberUUID, sessionId);

                    if (memberDataResponse.success) {
                        const memberData = memberDataResponse.data;

                        // Return the required fields in an object
                        return {
                            UUID: memberData.id, // Member UUID
                            memberName: memberData.name, // Member Name
                            discordID: memberData.discordId, // Member's Discord ID
                            position: memberData.position, // Member's position
                            teamsUUID: memberData.teams, // Teams the member belongs to
                        };
                    }
                    return null; // Return null if fetching this member's data fails
                })
            );

            // Filter out any null results from failed requests
            const validMemberData = memberDataList.filter((member) => member !== null);

            return {
                success: true,
                data: validMemberData,
            };
        } else {
            return {
                success: false,
                message: membersResponse.message || 'Failed to fetch member UUID list.',
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching the member data list.',
        };
    }
}

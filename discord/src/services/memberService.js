import axios from "axios";
import {env} from "../config/env.js";
import {sessionCookie} from "./auth.js";

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
                Cookie: sessionCookie // Use the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return response.data.data.id;  // Return the UUID
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
 * Sends a PUT request to the backend to update an existing member.
 *
 * @param {string} memberID - The UUID of the member to be updated.
 * @param {Object} memberData - The data to update in the member profile. At least one field is required.
 * @param {string} [memberData.name] - Optional. The member's updated name.
 * @param {string} [memberData.position] - Optional. The member's updated position.
 * @param {string} [memberData.profilePicture] - Optional. The updated URL to the member's profile picture.
 * @param {string} [memberData.phoneNumber] - Optional. The updated phone number of the member.
 * @param {string} [memberData.email] - Optional. The updated email of the member.
 * @param {string} [memberData.discordId] - Optional. The updated Discord ID of the member.
 * @param {Array<string>} [memberData.teams] - Optional. Array of updated team UUIDs the member belongs to.
 * @param {string} [memberData.notes] - Optional. Admin notes about the member.
 * @param {Object} [memberData.customDataPublic] - Optional. Updated custom public data for the member.
 * @param {Object} [memberData.customDataPrivate] - Optional. Updated custom private data for the member.
 * @returns {Promise<Object>} - Returns an object containing the success state and the updated member data.
 *    - {boolean} success - True if the member update was successful, false otherwise.
 *    - {string} message - The success or error message.
 *    - {Object} [data] - The updated member data on success.
 */
export async function updateMember(memberID, memberData) {
    try {
        // Ensure that at least one field to update is present
        if (!Object.keys(memberData).length) {
            return {
                success: false,
                message: 'No fields provided for update.'
            };
        }

        const response = await axios.put(`${env.backendURL}/member/${memberID}`, memberData, {
            headers: {
                Cookie: sessionCookie // Pass the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Member ${memberID} updated successfully.`,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to update member.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while updating the member.'
        };
    }
}

/**
 * Sends a DELETE request to the backend to soft delete a member.
 *
 * @param {string} memberID - The UUID of the member to be deleted.
 * @returns {Promise<Object>} - Returns an object containing the success state and the deleted member's data.
 *    - {boolean} success - True if the member deletion was successful, false otherwise.
 *    - {string} message - The success or error message.
 *    - {Object} [data] - Contains the deleted member data (ID and leave date) on success.
 */
export async function deleteMember(memberID) {
    try {
        const response = await axios.delete(`${env.backendURL}/member/${memberID}`, {
            headers: {
                Cookie: sessionCookie // Pass the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                message: `Member ${memberID} deleted successfully.`,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to delete member.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while deleting the member.'
        };
    }
}

/**
 * Sends a GET request to retrieve a list of all member UUIDs.
 *
 * @returns {Promise<Object>} - Returns an object containing the success state and the list of member UUIDs.
 *    - {boolean} success - True if the request was successful, false otherwise.
 *    - {Array<string>} [data] - Contains an array of member UUIDs on success.
 *    - {string} [message] - Error message in case of failure.
 */
export async function getMemberUUIDList() {
    try {
        const response = await axios.get(`${env.backendURL}/member`);

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.error || 'Failed to fetch member UUID list.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching the member UUID list.'
        };
    }
}

/**
 * Sends a GET request to retrieve public data of a specific member by UUID.
 *
 * @param {string} memberUUID - The UUID of the member to retrieve.
 * @returns {Promise<Object>} - Returns an object containing the success state and the member's public data.
 *    - {boolean} success - True if the request was successful, false otherwise.
 *    - {Object} [data] - Contains the public member data on success.
 *    - {string} [message] - Error message in case of failure.
 */
export async function getMemberDataPublic(memberUUID) {
    try {
        const response = await axios.get(`${env.backendURL}/member/${memberUUID}`);

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to fetch public member data.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching public member data.'
        };
    }
}

/**
 * Sends a GET request to retrieve private data of a specific member by UUID.
 *
 * @param {string} memberUUID - The UUID of the member to retrieve.
 * @returns {Promise<Object>} - Returns an object containing the success state and the member's private data.
 *    - {boolean} success - True if the request was successful, false otherwise.
 *    - {Object} [data] - Contains the private member data on success.
 *    - {string} [message] - Error message in case of failure.
 */
export async function getMemberDataPrivate(memberUUID) {
    try {
        const response = await axios.get(`${env.backendURL}/member/${memberUUID}`, {
            headers: {
                Cookie: sessionCookie // Pass the session cookie for authentication
            }
        });

        if (response.status === 200) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                message: response.data.message || 'Failed to fetch private member data.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching private member data.'
        };
    }
}

/**
 * Combines data from existing functions to return a specific subset of member data:
 * UUID, memberName, discordID, position, and teamsUUID.
 *
 * @returns {Promise<Object>} - Returns an object containing the success state and the list of member data.
 *    - {boolean} success - True if the request was successful, false otherwise.
 *    - {Array<Object>} [data] - Contains an array of objects with the member details (UUID, memberName, discordID, position, and teamsUUID) on success.
 *    - {string} [message] - Error message in case of failure.
 */
export async function getAllMemberDataList() {
    try {
        // Fetch the list of all member UUIDs
        const membersResponse = await getMemberUUIDList();

        if (membersResponse.success) {
            const memberDataList = await Promise.all(membersResponse.data.map(async (memberUUID) => {
                // Fetch public data for each member
                const memberDataResponse = await getMemberDataPublic(memberUUID);

                if (memberDataResponse.success) {
                    const memberData = memberDataResponse.data;

                    // Return the required fields in an object
                    return {
                        UUID: memberData.id,                     // Member UUID
                        memberName: memberData.name,             // Member Name
                        discordID: memberData.discordId,         // Member's Discord ID
                        position: memberData.position,           // Member's position
                        teamsUUID: memberData.teams              // Teams the member belongs to
                    };
                }
                return null; // Return null if fetching this member's data fails
            }));

            // Filter out any null results from failed requests
            const validMemberData = memberDataList.filter(member => member !== null);

            return {
                success: true,
                data: validMemberData
            };
        } else {
            return {
                success: false,
                message: membersResponse.message || 'Failed to fetch member UUID list.'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'An error occurred while fetching the member data list.'
        };
    }
}

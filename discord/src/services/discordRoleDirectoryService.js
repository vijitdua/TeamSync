// services/discordRoleService.js
import axios from 'axios';
import { env } from '../config/env.js';
import { sessionCookie } from './auth.js'; // Import session cookie from auth.js

// Function to initialize or update a role's details
async function updateRoleDetails(discordRoleID, roleName, roleColor) {
    try {
        const roleData = {
            discordID: discordRoleID,
            roleName,
            roleColor: roleColor || null,
        };

        // Check if role exists
        const getResponse = await axios.get(`${env.backendURL}/discord/role/${discordRoleID}`).catch(error => {
            if (error.response && error.response.status !== 404) {
                // console.error(`Failed to get role ${discordRoleID}:`, error.message);
            }
        });

        // If role exists, delete it
        if (getResponse && getResponse.status === 200 && getResponse.data.success) {
            await axios.delete(`${env.backendURL}/discord/role/${discordRoleID}`, {
                headers: {
                    Cookie: sessionCookie
                }
            }).catch(error => {
                console.error(`Failed to delete role ${discordRoleID}:`, error.message);
            });
        }

        const response = await axios.post(`${env.backendURL}/discord/role`, roleData, {
            headers: {
                Cookie: sessionCookie // Use session cookie from auth.js
            }
        });

        if (response.status === 200) {
            console.log(`Role ${roleName} updated or initialized successfully.`);
        } else {
            console.error(`Error updating role: ${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error in role update: ${error.message}`);
    }
}

async function deleteAllRoles() {
    try {
        const response = await axios.delete(`${env.backendURL}/discord/role`, {
            headers: {
                Cookie: sessionCookie // Use session cookie from auth.js
            }
        });

        if (response.status === 200) {
            console.log('All roles deleted successfully.');
        } else {
            console.error(`Error deleting roles: ${response.data.message}`);
        }
    } catch (error) {
        console.error(`Error in role deletion: ${error.message}`);
    }
}

async function reinitializeRoles(guild) {
    try {
        // Fetch all roles from the guild
        const roles = await guild.roles.fetch();

        for (const [id, role] of roles) {
            const discordRoleID = role.id;
            const roleName = role.name;
            const roleColor = role.hexColor;

            // Reinitialize role in the backend
            await updateRoleDetails(discordRoleID, roleName, roleColor);
        }
        console.log('Roles reinitialized successfully.');
    } catch (error) {
        console.error('Error reinitializing roles:', error);
    }
}

export { updateRoleDetails, deleteAllRoles, reinitializeRoles };

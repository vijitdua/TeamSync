// events/roleEvents.js
import { updateRoleDetails } from '../services/discordRoleDirectoryService.js';

export function setupRoleEvents(client) {
    // Listen for when a role is updated
    client.on('roleUpdate', async (oldRole, newRole) => {
        const discordRoleID = newRole.id;
        const roleName = newRole.name;
        const roleColor = newRole.hexColor; // Extract role color

        try {
            await updateRoleDetails(discordRoleID, roleName, roleColor);
            console.log(`Role updated: ${roleName} (${discordRoleID})`);
        } catch (error) {
            console.error(`Failed to update role ${roleName}:`, error.message);
        }
    });

    // Listen for when a new role is created
    client.on('roleCreate', async (newRole) => {
        const discordRoleID = newRole.id;
        const roleName = newRole.name;
        const roleColor = newRole.hexColor; // Extract role color

        try {
            await updateRoleDetails(discordRoleID, roleName, roleColor);
            console.log(`Role created: ${roleName} (${discordRoleID})`);
        } catch (error) {
            console.error(`Failed to create role ${roleName}:`, error.message);
        }
    });
}

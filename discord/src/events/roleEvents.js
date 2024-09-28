// events/roleEvents.js
import { updateRoleDetails } from '../services/discordRoleDirectoryService.js';

export function setupRoleEvents(client) {
    // Listen for when a role is updated
    client.on('guildRoleUpdate', async (oldRole, newRole) => {
        const discordRoleID = newRole.id;
        const roleName = newRole.name;

        await updateRoleDetails(discordRoleID, roleName);
    });

    // Listen for when a new role is created
    client.on('roleCreate', async (newRole) => {
        const discordRoleID = newRole.id;
        const roleName = newRole.name;

        await updateRoleDetails(discordRoleID, roleName);
    });
}

// events/memberEvents.js
import { updateMemberDetails } from '../services/discordMemberDirectoryService.js';

export function setupMemberEvents(client) {
    // Listen for when a member updates their profile
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
        const discordID = newMember.id;
        const discordUsername = newMember.user.username;
        const discordDisplayName = newMember.displayName;
        const discordProfilePictureUrl = newMember.user.displayAvatarURL();
        const discordRoleIDs = newMember.roles.cache.map(role => role.id);

        await updateMemberDetails(discordID, discordUsername, discordDisplayName, discordProfilePictureUrl, discordRoleIDs);
    });

    // Listen for when a new member joins the server
    client.on('guildMemberAdd', async (newMember) => {
        const discordID = newMember.id;
        const discordUsername = newMember.user.username;
        const discordDisplayName = newMember.displayName;
        const discordProfilePictureUrl = newMember.user.displayAvatarURL();
        const discordRoleIDs = newMember.roles.cache.map(role => role.id);

        await updateMemberDetails(discordID, discordUsername, discordDisplayName, discordProfilePictureUrl, discordRoleIDs);
    });
}

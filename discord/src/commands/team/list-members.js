// commands/team/list-members.js

import { SlashCommandBuilder } from 'discord.js';
import { getTeamPrivateData, getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';
import { getMemberDataPrivate, getAllMemberDataList } from '../../services/memberService.js';

export const data = new SlashCommandBuilder()
    .setName('team-list-members')
    .setDescription('Lists all members of a specified team.')
    .addStringOption(option =>
        option.setName('team-uuid')
            .setDescription('The UUID of the team.')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-role')
            .setDescription('The Discord role associated with the team.')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('public-visibility')
            .setDescription('Whether the response should be pasted in the channel (true) or visible only to you (default: false).')
            .setRequired(false));

export async function execute(interaction) {
    // Determine if the response should be ephemeral
    const publicVisibility = interaction.options.getBoolean('public-visibility');
    const isEphemeral = !(publicVisibility ?? false);

    try {
        const teamUUID = interaction.options.getString('team-uuid');
        const discordRole = interaction.options.getRole('discord-role');

        let finalTeamUUID = teamUUID;

        // If teamUUID is not provided but discordRole is, fetch the teamUUID using the discordRole ID
        if (!finalTeamUUID && discordRole) {
            finalTeamUUID = await getTeamUUIDByDiscordRoleId(discordRole.id);
            if (!finalTeamUUID) {
                throw new Error(`Failed to fetch team UUID for Discord role: ${discordRole.name}.`);
            }
        }

        // If neither teamUUID nor discordRole is provided, throw an error
        if (!finalTeamUUID) {
            throw new Error('You must provide either a team UUID or a Discord role.');
        }

        // Fetch team data
        const teamDataResponse = await getTeamPrivateData(finalTeamUUID);
        if (!teamDataResponse.success) {
            throw new Error(teamDataResponse.message || `Failed to fetch data for team UUID: ${finalTeamUUID}.`);
        }

        const teamData = teamDataResponse.data;
        const teamName = teamData.name || 'Unknown Team';
        const teamDiscordRoleId = teamData.discordId;

        // Fetch all member data
        const allMembersResponse = await getAllMemberDataList();
        if (!allMembersResponse.success) {
            throw new Error(allMembersResponse.message || 'Failed to fetch member data.');
        }

        const allMembers = allMembersResponse.data;

        // Debugging Logs (Optional)
        console.log(`Total members fetched: ${allMembers.length}`);
        allMembers.forEach(member => {
            console.log(`Member UUID: ${member.UUID}, Teams: ${member.teamsUUID}`);
        });

        // Filter members who belong to the specified team
        const teamMembers = allMembers.filter(member => Array.isArray(member.teamsUUID) && member.teamsUUID.includes(finalTeamUUID));

        // Fetch detailed data for each member
        const detailedMembers = await Promise.all(teamMembers.map(async (member) => {
            const memberDataResponse = await getMemberDataPrivate(member.UUID);
            if (memberDataResponse.success) {
                return memberDataResponse.data;
            }
            return null;
        }));

        // Filter out any members whose data couldn't be fetched
        const validMembers = detailedMembers.filter(member => member !== null);

        // Prepare the response message
        let responseMessage = `**${teamName} - ${teamDiscordRoleId ? `<@&${teamDiscordRoleId}>` : ''}**\n`;
        responseMessage += `teamUUID: ${finalTeamUUID}\n\n`;
        responseMessage += `## Members\n`;

        for (const member of validMembers) {
            const memberName = member.name || 'Unknown Member';
            const memberDiscordID = member.discordId ? `<@${member.discordId}>` : '@unknown';
            const memberUUID = member.id || 'N/A';

            // Safely check if teamsUUID exists and includes the teamUUID
            const hasTeam = Array.isArray(member.teamsUUID) && member.teamsUUID.includes(finalTeamUUID);

            // Fetch the member's roles in the context of this team
            // Assuming that the team role corresponds to the Discord role
            // Alternatively, if there are multiple roles, adjust accordingly
            const memberRoles = hasTeam ?
                (teamDiscordRoleId ? `<@&${teamDiscordRoleId}>` : 'No specific role') :
                'No specific role';

            responseMessage += `- ${memberName} ${memberDiscordID}\n`;
            responseMessage += `  - Role: ${memberRoles}\n`;
            responseMessage += `  - uuid: ${memberUUID}\n\n`;
        }

        // If there are no members in the team
        if (validMembers.length === 0) {
            responseMessage += 'No members found in this team.';
        }

        // If the message exceeds Discord's character limit for a single message, send as a file
        if (responseMessage.length > 2000) { // Discord's message character limit
            const buffer = Buffer.from(responseMessage, 'utf-8');
            await interaction.reply({
                files: [{
                    attachment: buffer,
                    name: `team-${finalTeamUUID}-members.txt`
                }],
                ephemeral: isEphemeral
            });
        } else {
            // Send the message as a reply
            await interaction.reply({
                content: responseMessage,
                ephemeral: isEphemeral
            });
        }

    } catch (error) {
        console.error('Error in team-list-members command:', error);
        await interaction.reply({
            content: `There was an error while executing this command: ${error.message}`,
            ephemeral: true
        });
    }
}

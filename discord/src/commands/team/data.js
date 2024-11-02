import { SlashCommandBuilder } from 'discord.js';
import { getTeamPrivateData, getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';
import { getDiscordIdByMemberUUID, getMemberDataPrivate } from '../../services/memberService.js';
import {getFinalKeyValuePairs} from "../../utils/objectFlatten.js";

export const data = new SlashCommandBuilder()
    .setName('team-data')
    .setDescription('Displays the data of a team by UUID or Discord role.')
    .addStringOption(option =>
        option.setName('team-id')
            .setDescription('The UUID of the team you want to view (optional if using Discord role).')
            .setRequired(false))
    .addRoleOption(option =>
        option.setName('discord-role')
            .setDescription('The Discord role associated with the team (optional if using team UUID).')
            .setRequired(false))
    .addBooleanOption(option =>
        option.setName('public-visibility')
            .setDescription('Whether the response should be pasted in the channel (true), or visible only to you (default: false)')
            .setRequired(false));

export async function execute(interaction) {
    // Correctly determine if the response should be ephemeral
    const publicVisibility = interaction.options.getBoolean('public-visibility');
    const isEphemeral = !(publicVisibility ?? false);

    try {
        const teamId = interaction.options.getString('team-id');
        const discordRole = interaction.options.getRole('discord-role');

        let teamUUID = teamId;

        // Fetch team UUID
        if (!teamUUID && discordRole) {
            teamUUID = await getTeamUUIDByDiscordRoleId(discordRole.id);
            if (!teamUUID) {
                throw new Error(`Failed to fetch team UUID for Discord role: ${discordRole.name}`);
            }
        }

        if (!teamUUID) {
            await interaction.reply({
                content: 'You must provide either a team UUID or a Discord role to view the team data.',
                ephemeral: true,
            });
            return;
        }

        // Fetch team data
        const response = await getTeamPrivateData(teamUUID);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch team data.');
        }

        const teamData = response.data;

        // Fetch team lead's data (name and Discord ID)
        const teamLeadDetails = await Promise.all(
            teamData.teamLead.map(async (leadUUID) => {
                const memberDataResponse = await getMemberDataPrivate(leadUUID);
                if (memberDataResponse.success && memberDataResponse.data) {
                    const memberData = memberDataResponse.data;
                    const name = memberData.name || 'Unknown Member';
                    const discordMention = memberData.discordId ? `<@${memberData.discordId}>` : '';
                    return discordMention ? `${name} (${discordMention})` : `${name}`;
                } else {
                    return `UUID: ${leadUUID}`;
                }
            })
        );

        const teamLeadDisplay = teamLeadDetails.length > 0 ? teamLeadDetails.join(', ') : 'No team lead found';

        const discordRoleMention = teamData.discordId ? `<@&${teamData.discordId}>` : '– No Discord role';

        // Construct response message
        let responseMessage = `## ${teamData.name} ${discordRoleMention}\n\n`;
        responseMessage += `UUID: ${teamData.id}\n`;
        responseMessage += `Team Lead(s): ${teamLeadDisplay}\n\n`;

        // Excluded fields
        const excludedFields = ['id', 'name', 'discordId', 'teamLead', 'updatedAt', 'deletedAt', 'createdAt', 'deletionDate'];

        // Append formatted team data
        responseMessage += getFinalKeyValuePairs(teamData, excludedFields);

        // Reply with the response
        await interaction.reply({
            content: responseMessage,
            ephemeral: isEphemeral,
        });

    } catch (error) {
        console.error('Error fetching team data:', error);
        await interaction.reply({
            content: `There was an error fetching the team's data: ${error.message}`,
            ephemeral: true,
        });
    }
}

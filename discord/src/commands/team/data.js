import { SlashCommandBuilder } from 'discord.js';
import { getTeamPrivateData, getTeamUUIDByDiscordRoleId } from '../../services/teamService.js';
import { getDiscordIdByMemberUUID } from '../../services/memberService.js';
import { env } from '../../config/env.js';

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

    const isEphemeral = !(interaction.options.getBoolean('public-visibility')) ?? false;

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

        // Fetch team lead details
        const teamLeadMentions = await Promise.all(
            teamData.teamLead.map(async (leadUUID) => {
                const discordId = await getDiscordIdByMemberUUID(leadUUID);
                return discordId ? `<@${discordId}>` : `UUID: ${leadUUID}`;
            })
        );

        const teamLeadDisplay = teamLeadMentions.length > 0 ? teamLeadMentions.join(', ') : 'No team lead found';
        const discordRoleMention = teamData.discordId ? `<@&${teamData.discordId}>` : '– No Discord role';

        // Construct response message
        let responseMessage = `## ${teamData.name} ${discordRoleMention}\n\n`;
        responseMessage += `UUID: ${teamData.id}\n`;
        responseMessage += `Team Lead(s): ${teamLeadDisplay}\n\n`;

        // Excluded fields
        const excludedFields = ['id', 'name', 'discordId', 'teamLead', 'updatedAt', 'deletedAt', 'createdAt'];

        // Recursive data formatting
        function formatTeamData(data) {
            let message = '';

            function recurse(obj) {
                for (const key in obj) {
                    if (excludedFields.includes(key)) continue;

                    const value = obj[key];

                    if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value)) {
                            message += `### ${key}\n`;
                            value.forEach((item) => {
                                message += `- ${item}\n`;
                            });
                        } else {
                            message += `### ${key}\n`;
                            recurse(value);
                        }
                    } else {
                        message += `### ${key}\n${value}\n`;
                    }
                }
            }

            recurse(data);
            return message;
        }

        responseMessage += formatTeamData(teamData);

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

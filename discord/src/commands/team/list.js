import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllTeamDataList } from '../../services/teamService.js';
import {getMemberDataPrivate, getMemberDataPublic} from '../../services/memberService.js';

export const data = new SlashCommandBuilder()
    .setName('team-list')
    .setDescription('Displays a list of all teams with details.');

export async function execute(interaction) {
    try {
        // Fetch all teams' data
        const response = await getAllTeamDataList();

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch team data.');
        }

        const teams = response.data;

        // Prepare embed(s)
        const embeds = [];
        let currentEmbed = new EmbedBuilder()
            .setTitle('Team List')
            .setColor(0x3498db);

        let fieldCount = 0;
        let totalEmbedCharacters = 0;

        for (const team of teams) {
            // Fetch team lead's data (name and Discord ID)
            const teamLeadDetails = await Promise.all(
                team.teamLeadUUIDs.map(async (leadUUID) => {
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

            // Check if the role is properly assigned
            const discordRole = team.teamDiscordRoleId ? `<@&${team.teamDiscordRoleId}>` : 'No role assigned';

            // Construct field value
            const fieldValue = `**UUID:** \`${team.teamUUID}\`\n` +
                `**Discord Role:** ${discordRole}\n` +
                `**Team Lead(s):** ${teamLeadDisplay}\n` +
                `**Description:** ${team.description || 'No description'}`;

            // Ensure field value does not exceed 1024 characters
            const truncatedFieldValue = fieldValue.length > 1024 ? fieldValue.substring(0, 1021) + '...' : fieldValue;

            // Calculate new total characters if this field is added
            const additionalChars = team.teamName.length + truncatedFieldValue.length;
            if (
                fieldCount >= 25 ||
                totalEmbedCharacters + additionalChars > 6000
            ) {
                // Start a new embed
                embeds.push(currentEmbed);
                currentEmbed = new EmbedBuilder()
                    .setTitle('Team List (Continued)')
                    .setColor(0x3498db);
                fieldCount = 0;
                totalEmbedCharacters = 0;
            }

            // Add team info as a field
            currentEmbed.addFields({
                name: team.teamName,
                value: truncatedFieldValue,
            });

            fieldCount++;
            totalEmbedCharacters += additionalChars;
        }

        // Add the last embed if it has fields
        if (fieldCount > 0) {
            embeds.push(currentEmbed);
        }

        // Send the embeds in batches (Discord allows up to 10 embeds per message)
        const maxEmbedsPerMessage = 10;
        for (let i = 0; i < embeds.length; i += maxEmbedsPerMessage) {
            const embedsSlice = embeds.slice(i, i + maxEmbedsPerMessage);
            if (i === 0) {
                await interaction.reply({ embeds: embedsSlice, ephemeral: true });
            } else {
                await interaction.followUp({ embeds: embedsSlice, ephemeral: true });
            }
        }

    } catch (error) {
        console.error('Error fetching team list:', error);
        await interaction.reply({
            content: `There was an error fetching the team list: ${error.message}`,
            ephemeral: true,
        });
    }
}

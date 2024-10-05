import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllTeamDataList } from '../../services/teamService.js';
import { getDiscordIdByMemberUUID } from '../../services/memberService.js';

export const data = new SlashCommandBuilder()
    .setName('team-list')
    .setDescription('Displays a list of all teams with details using embeds.');

export async function execute(interaction) {
    try {
        // Fetch all teams' data
        const response = await getAllTeamDataList();

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch team data.');
        }

        const teams = response.data;

        // Create an array of embed objects to send
        const embeds = [];

        // Iterate over each team and build an embed for it
        for (const team of teams) {
            // Fetch team lead's Discord ID or display their UUID if Discord ID is unavailable
            const teamLeadDetails = await Promise.all(
                team.teamLeadUUIDs.map(async (leadUUID) => {
                    const discordId = await getDiscordIdByMemberUUID(leadUUID);
                    return discordId ? `<@${discordId}>` : `UUID: ${leadUUID}`;
                })
            );

            const teamLeadDisplay = teamLeadDetails.length > 0 ? teamLeadDetails.join(', ') : 'No team lead found';

            // Check if the role is properly assigned
            const discordRole = team.teamDiscordRoleId ? `<@&${team.teamDiscordRoleId}>` : 'No role assigned';

            // Create a new embed for the team
            const embed = new EmbedBuilder()
                .setTitle(team.teamName)
                .setColor(0x3498db) // You can adjust the color
                .setDescription(`Team UUID: \`${team.teamUUID}\``)
                .addFields(
                    { name: 'Discord Role', value: discordRole, inline: true },
                    { name: 'Team Lead(s)', value: teamLeadDisplay, inline: true },
                    { name: 'Description', value: team.description || 'No description', inline: false }
                );

            // Add the embed to the list
            embeds.push(embed);
        }

        // Send the embeds as a response
        await interaction.reply({
            embeds: embeds,
            ephemeral: true // You can change this to false if you want it visible to all
        });

    } catch (error) {
        console.error('Error fetching team list:', error);
        await interaction.reply({
            content: `There was an error fetching the team list: ${error.message}`,
            ephemeral: true
        });
    }
}

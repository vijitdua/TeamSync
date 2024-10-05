import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAllMemberDataList } from '../../services/memberService.js';
import { getTeamPublicData } from '../../services/teamService.js';

export const data = new SlashCommandBuilder()
    .setName('member-list')
    .setDescription('Displays a list of all members with details using embeds.');

export async function execute(interaction) {
    try {
        // Fetch all members' data
        const response = await getAllMemberDataList();

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch member data.');
        }

        const members = response.data;

        // Create an array of embed objects to send
        const embeds = [];

        // Iterate over each member and build an embed for it
        for (const member of members) {
            // Fetch teams and handle unknown ones
            const teamDetails = await Promise.all(
                member.teamsUUID.map(async (teamUUID) => {
                    const teamData = await getTeamPublicData(teamUUID);
                    if (teamData.success && teamData.data) {
                        const teamName = teamData.data.name || 'Unknown Team';
                        const discordRole = teamData.data.discordId ? `<@&${teamData.data.discordId}>` : 'No Discord Role';
                        return teamName !== 'Unknown Team' ? `${teamName} ${discordRole}` : null;
                    }
                    return null; // Return null if team fetching fails
                })
            );

            const filteredTeamDetails = teamDetails.filter(team => team !== null); // Skip unknown teams
            const teamDisplay = filteredTeamDetails.length > 0
                ? filteredTeamDetails.join('\n• ')
                : 'No teams assigned';

            // Create the Discord mention if available
            const discordDisplay = member.discordID ? `<@${member.discordID}>` : 'No Discord ID';

            // Create a new embed for the member
            const embed = new EmbedBuilder()
                .setTitle(`${member.memberName}`)
                .setColor(0x3498db) // You can adjust the color
                .setDescription(`UUID: \`${member.UUID}\``)
                .addFields(
                    { name: 'Discord', value: discordDisplay, inline: true },  // Now shows Discord mention in the body
                    { name: 'Position', value: member.position || 'No position', inline: true },
                    { name: 'Teams', value: `• ${teamDisplay}`, inline: false }
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
        console.error('Error fetching member list:', error);
        await interaction.reply({
            content: `There was an error fetching the member list: ${error.message}`,
            ephemeral: true
        });
    }
}
